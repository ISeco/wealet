# Conventions, Patterns, Testing & CI/CD

## Coding conventions

- **Conventional Commits**: `feat(funds): add derived balance query`, `fix(auth): rotate refresh on reuse`
- Open a PR for every feature even working solo — write a one-line *why* in the description
- Pre-commit hooks via husky + lint-staged: ESLint + Prettier + `tsc --noEmit`
- No magic numbers — currency exponents, JWT lifetimes, runway thresholds → named constants in `config/`
- Guard clauses / early returns over nested if-else
- DTOs never expose DB entities — always use a mapper

---

## Patterns in use

Apply naturally when the use case fits. Never force them.

| Pattern | Where it applies |
|---|---|
| **Repository** (interface + DI token) | Services depend on the interface, not TypeORM concrete class |
| **Strategy** | `FinancialFrameworkStrategy` — adding a new framework = new class only, existing code untouched |
| **DTO + Mapper** | No entity leaks through the API surface |
| **Money Value Object** | `Money(amount, currency)` instead of raw `bigint` everywhere (avoids primitive obsession) |
| **Unit of Work** | `DataSource.transaction()` for atomic transfers |
| **Factory / Seed** | Jars of Eker preset = factory that creates 6 Fund rows |

### What we deliberately do NOT do
- No microservices, CQRS/event-sourcing, or hexagonal ports-and-adapters
- No abstractions without a concrete benefit today
- No `synchronize: true` — ever
- No Redux — `useState` for local UI state, React Query for server state

**Rule:** every pattern must pay for its complexity with a concrete benefit now. If it doesn't, leave it out.

---

## Testing strategy

| Level | Tool | What it covers |
|---|---|---|
| Unit | Jest | Services with mocked repos; `Money` helper; dedupe logic; balance/runway calculators |
| Integration | Jest + real Postgres test DB | Repository queries, report aggregations |
| E2E | Jest + supertest | Full HTTP flows; **cross-user auth** (user A cannot access user B's data) |

**Coverage focus** (not 100%): money calculations, derived fund balances, atomic transfers, import dedupe, cross-user authorization.

The cross-user auth tests are mandatory — they prove multi-tenancy actually works, not just in theory.

**Local e2e DB**: e2e tests run against `wealet_test` (separate Postgres DB), not `wealet_dev` — `apps/api/test/setup-env.ts` loads `apps/api/.env.test` (gitignored, same shape as `.env.example` with `DB_DATABASE=wealet_test`) before the app boots, overriding whatever `.env` set. In CI this file doesn't exist, so the job-level env vars (pointing at the ephemeral Postgres service, also named `wealet_test`) are used untouched.

**Zero-step setup on a fresh clone**: `docker-compose.yml` mounts `docker/init-test-db.sql`, which creates the `wealet_test` database the first time the Postgres container initializes its volume. `pnpm --filter api test:e2e` runs a `pretest:e2e` hook (`apps/api/scripts/migrate-test-db.js`) that applies pending migrations to `wealet_test` automatically before every e2e run — no manual `migration:run` step needed after `docker-compose up` + `pnpm install`.

---

## CI/CD

### GitHub Actions (runs on every push and PR)
1. `lint` — ESLint + Prettier check
2. `type-check` — `tsc --noEmit`
3. `test` — unit + e2e with Postgres service in the runner
4. `build` — back and front
5. On green `main` → autodeploy to Railway + Vercel

### Deploy targets
- **Backend + Postgres → Railway**. Migrations run at deploy (`migration:run`), never `synchronize`.
- **Frontend → Vercel**.
- **Env vars**: validated at boot (joi) — server won't start if a required var is missing.
- **Secrets**: only in Railway/Vercel dashboards. `.env.example` in repo, `.env` in `.gitignore`.

CI green badge in README = quick trust signal.
