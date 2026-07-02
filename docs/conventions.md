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
| **Repository** (TypeORM `Repository<Entity>` via `@InjectRepository()`) | Services depend on it directly — no extra interface/DI-token layer; NestJS DI already lets tests mock it |
| **Strategy** | `FinancialFrameworkStrategy` pattern was evaluated but removed — framework targets now live as `frameworkSlot` + `targetPercentage` on each `Fund` row, which is more granular and needs no extra abstraction |
| **DTO + Mapper** | No entity leaks through the API surface |
| **Money helper** | `formatMoney`/`parseMoney` in `common/money/` format `bigint` for presentation — not a `Money(amount, currency)` Value Object, since nothing yet needs Money instances to carry behavior beyond formatting |
| **Unit of Work** | `DataSource.transaction()` for atomic transfers |
| **Factory / Seed** | Jars of Eker preset = factory that creates 6 Fund rows |
| **Component extraction** (frontend) | When two or more forms/screens in a feature repeat the same markup (a field, a button, an icon), pull it into a small component under `features/<feature>/components/` instead of duplicating it. See `features/auth/components/` |
| **Section colocation** (frontend) | When a page grows into a "god component" — concentrating state, hooks and markup for multiple independent sections — extract each section into its own component. A section qualifies for extraction when it has its own local state and/or its own data hooks and does not share mutable state with sibling sections. The page component becomes pure composition. Shared style tokens (`card`, `settingsRow`) live in a `styles.ts` alongside the page. See `features/settings/`. |

#### Section extraction criteria

Extract a section into its own component when **all three** are true:
1. It has local state (`useState`) or data hooks (`useQuery` / `useMutation`) of its own
2. That state is not read or mutated by any sibling section
3. The section is large enough that its presence in the page file obscures the overall structure (~40+ lines of JSX)

**Do not extract** when:
- The section is a few lines with no state — inline is cleaner
- Two sections share mutable state (e.g., one section opens a modal that another section triggers) — keep them together or lift state to the page
- Extraction would require passing props back down just to reconnect what was co-located — prop drilling as a result of extraction is a signal the boundary is wrong

---

### Standardization pass on a feature

Rule: **once a feature works end-to-end, do a pass to find where it silently diverged from the rest of the app** — before adding more on top of it. This is how the onboarding + import cleanup (see `estado-actual.md`) and the health feature audit (2026-07) came about: functional code that grew its own local answer to a problem the codebase already solved elsewhere. It's cheap to fix right after a feature stabilizes; expensive once three more features have copied the divergent version.

When to run it: after a feature's first end-to-end implementation, or before extending an existing feature with meaningful new UI/logic — not on every small fix.

What to check, concretely:
- **Hand-rolled UI that duplicates a shared primitive.** Before writing a backdrop + panel + close button, check `components/ui/Modal.tsx`. Before a `<button style={{...}}>`, check `components/ui/Button.tsx`. A component that reimplements what `ui/` already offers is the clearest signal — grep for the shared component's name across sibling features to confirm it's the established pattern, then migrate.
- **Domain formatting reimplemented locally.** `formatMoney`/`formatThousands`/`parseMoney` (`lib/money.ts`) are the only sanctioned way to format `bigint` amounts. A local `'$' + something` helper is a duplicate, not a new pattern.
- **Hardcoded hex colors instead of theme CSS variables.** If a literal hex (`#16A89A`, `#D97706`, etc.) matches a `var(--disp)` / `var(--res)` / `var(--comp)` value in light mode, it silently breaks in dark mode (the var remaps, the literal doesn't). Grep the hex against `index.css` before assuming it's a one-off brand color.
- **The same domain fact encoded in more than one place.** Example: a framework → slot-prefix mapping duplicated across three components instead of imported from one place. If two features (or two components in the same feature) each hardcode the same enum/mapping, one of them will drift — this already happened once with jars_eker fund names between `fund-presets.ts` and `framework-funds.ts`.
- **God components per the extraction criteria above** — apply the same 40+ lines / independent-state test to older features, not just new ones.

Fix only what has a **confirmed second occurrence** (an existing shared component, an existing util, an existing CSS var) — this is deduplication against something that already exists, not speculative abstraction. If nothing already exists to converge on, that's a `decisions.md` conversation, not a silent refactor.

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
