# Architecture Decisions

Consult this file when you need to understand *why* something is built a certain way,
or before making a decision that might conflict with an existing one.

---

## ADR-01 — Modular Monolith (not microservices)

Single NestJS backend organized in modules with explicit domain boundaries.
Each module exposes its service as an internal API — no module accesses another module's repository directly.

**Trade-off:** everything deploys together. Acceptable at this scale. Modular structure leaves the door open to extract a service later if needed.

---

## ADR-02 — TypeORM with versioned migrations

TypeORM as ORM. Migrations versioned in git. `synchronize: false` in all environments — no exceptions.

**Trade-off:** worse DX than Prisma. Chosen because it aligns with the enterprise stack used in ongoing job interviews and can be defended in depth.

---

## ADR-03 — Money as integer in minimum currency unit

Amounts stored as `BIGINT` in the currency's minimum unit. Never `FLOAT` or `DECIMAL`.
CLP has no decimals (1 peso = 1 unit). USD has 2 decimal places (1 dollar = 100 cents).
`currency` field (ISO 4217) on every transaction, default `CLP`.
All formatting goes through the `Money` helper in `common/money/`.

**Trade-off:** presentation layer must format (divide by 10^exponent). Minimal cost; the helper encapsulates it.

---

## ADR-04 — JWT access token + rotating refresh token

- Access token: short-lived (~15 min), returned in response body, stored in memory on the client (NOT localStorage).
- Refresh token: long-lived (~7 days), stored **hashed** in DB, sent as `httpOnly; Secure; SameSite=None` cookie.
- Refresh is **rotated** on each use — old token revoked immediately on reuse detection.
- Passwords hashed with `argon2`.
- Cross-origin setup (Vercel + Railway): CORS with `credentials: true`, explicit origin whitelist.

**Trade-off:** more moving parts (`/refresh` endpoint, rotation logic). Worth it — auth is the first thing a technical reviewer looks at.

---

## ADR-05 — Row-level multi-tenancy

Every user-owned entity has `userId` FK. Isolation enforced in the service layer: `userId` always comes from `@CurrentUser()` (the authenticated JWT), never from the request body.

No controller builds queries. No service trusts a client-supplied `userId`.

Verified by mandatory cross-user E2E tests (user A cannot read or modify user B's data).

**Trade-off:** not DB-level RLS (Postgres row-level security). The explicit service pattern + tests is more demonstrable and less fragile for this scope.

---

## ADR-06 — Excel import: preview before commit

Import is a two-step flow: **parse + validate → preview (with duplicate flags) → confirmed commit**.
Duplicate detection via a hash of (sheet name + fund name + cell reference + amount), stored as `dedupeHash` —
the physical Excel cell is a more reliable identity than (date + amount + description) for this ledger format,
since the same description can repeat across unrelated rows.
Uniqueness enforced at DB level (partial unique index where `source = 'import'`).

**Trade-off:** more work than a direct INSERT. This is the feature with the highest signal-per-hour-invested ratio — don't simplify it.

---

## ADR-07 — Envelope system (Funds) as core domain

The domain spine is `Fund` (envelope), not loose transactions.
Each fund has a `classification`: `available`, `reserve`, or `committed`.
Every transaction hits exactly one fund (`fundId`).
Reallocations between funds are `Transfer` — they don't change net worth.
Fund balance is derived via SQL aggregation (never a stored column).

**Downstream design decisions:**
- Net worth = aggregate funds by `classification`
- Runway = `Σ(funds where countsForRunway = true)` ÷ average monthly burn
- Jars of Eker = a factory that seeds 6 funds with preset classifications — no extra schema needed
- Categories remain, but as an analysis dimension on transactions, not the domain spine

**Trade-off:** more complex than Category + Transaction. The atomic transfer, derived balance, and segmented net worth are the technically interesting parts — don't simplify them away.

**Note — API additions from design review (2026-06):** the design prototype surfaced a few endpoints the original API lacked. Importantly, they introduce **no new pattern**: `/funds/:id/history` and `/reports/cash-flow` are SQL-aggregated reads consistent with the derived-balance rule above, and `/funds/preset` is the implementation of the Jars-factory seed mentioned in this ADR. The canonical endpoint list lives in `modules.md` (single source of truth) — not duplicated here.

---

## §7 — Engineering Best Practices

### Architecture
- Domain logic (balance derivation, runway, framework adherence, dedupe) lives **inline in each module's service** (`funds.service.ts`, `reports.service.ts`, `import-export.service.ts`), not split into separate calculator classes. At this scale, one service per domain is the right level of indirection — splitting `BalanceCalculator`/`RunwayCalculator`/`DedupeService` out today would be an abstraction with a single caller and no real benefit (see "what we deliberately don't do" below).
- Services inject TypeORM's `Repository<Entity>` directly via `@InjectRepository()` — no repository-interface/DI-token layer on top. NestJS's own DI already lets tests mock the repository; an extra interface would duplicate what NestJS gives for free.
- We do NOT do full hexagonal/ports-and-adapters — too much ceremony for a project this size.

### SOLID applied to this project
- **S**: one service per domain; `reports/` (read) is separate from `transactions/` (write). A service owns one aggregate's read+write logic rather than being split further.
- **O**: financial frameworks (50/30/20, Jars, Fondos) behind a `FinancialFrameworkStrategy` interface. Adding a new one = new class only. This is the one place in the codebase where the extra interface earns its cost — frameworks really do get added.
- **L**: all strategies honor the same contract; interchangeable without breaking consumers.
- **I**: small, focused interfaces where they exist — specific DTOs per endpoint; `FinancialFrameworkStrategy` is intentionally narrow (one method).
- **D**: services depend on NestJS DI to receive their `Repository<Entity>` and collaborator services — concrete TypeORM types, not hand-rolled abstractions over them.

### Clean Code
- Names express intent. Short functions with a single job. No magic numbers — use named constants.
- Guard clauses and early returns over nested conditionals.
- DRY with judgment — KISS and YAGNI take priority. Don't abstract until there are 2–3 real uses.

### Repository hygiene
- **Conventional Commits** — commit history tells a story a reviewer can follow.
- **PRs even when working solo** — one-line description of the *why*.
- **husky + lint-staged** — lint + format + `tsc --noEmit` before every commit. The repo never accumulates noise.

### What we deliberately don't do
- No microservices, CQRS with event sourcing, or full hexagonal architecture.
- No "just in case" abstractions (interfaces with a single implementation that will never change).
- **The rule:** every abstraction must pay for its complexity with a concrete benefit today. If it doesn't, leave it out.
