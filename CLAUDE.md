# Wealet

Personal finance app built on an envelope/fund system. Full-stack portfolio project.

## Project

- **Backend**: NestJS + TypeScript + PostgreSQL (TypeORM) — `apps/api`
- **Frontend**: React + Vite + Recharts — `apps/web`
- **Shared types**: `packages/shared`
- **Monorepo**: pnpm workspaces

## Commands

- Dev (API): `pnpm --filter api dev`
- Dev (web): `pnpm --filter web dev`
- Tests: `pnpm test`
- Lint: `pnpm lint`
- Type check: `pnpm type-check`
- New migration: `pnpm --filter api migration:generate -- src/database/migrations/MigrationName`
- Run migrations: `pnpm --filter api migration:run`

## Language

- All user-facing text (UI labels, placeholders, messages, buttons) must use **español neutro** — no regional variants. Avoid voseo ("tenés", "hacés") and any River Plate or country-specific expressions. Use tuteo ("tienes", "haces") or infinitives instead.

## Code Style

- Controller → Service → Repository. Controllers never touch repositories directly.
- Money amounts are always `bigint` (minimum currency unit). Never `float`.
- Every query on a user-owned entity must filter by `userId` from `@CurrentUser()`.
- Fund balances are derived via SQL aggregation — no `balance` column on `Fund`.
- Transfers between funds are atomic — single DB transaction, both sides or neither.
- Use 2-space indentation. Prefer named exports.

## Standardization applies to new code too

The "Standardization pass on a feature" rule (`docs/conventions.md`) isn't just a retroactive cleanup exercise — it applies while writing new code, not only when auditing old code. Covers both:

- **UI primitives**: when adding a button, modal, icon, money format, or color to *any* file, check `components/ui/` and `lib/money.ts` first, the same way you would during an audit pass.
- **Logic organization**: when adding new service/hook/util logic, check whether an existing service, repository method, hook, or util already owns that responsibility before writing a parallel implementation. Keep Controller → Service → Repository delegation (see Code Style above) and the section-extraction criteria (`docs/conventions.md`) in mind for new code, not just when refactoring an existing god component.

Don't hand-roll or duplicate something next to code you just finished migrating/extracting in the same session — write new code against the shared pattern from the start.

## After every implementation

After completing any feature, endpoint, or significant refactor, add a bullet to `docs/estado-actual.md` describing what was added, what changed behavior, and what remains pending. Keep it concise — it's a snapshot for the next session, not a changelog.

## Reference Docs

- Data model → `docs/data-model.md`
- Module map, API endpoints & screen→endpoint map → `docs/modules.md`
- Estado actual, features implementadas y pendientes → `docs/estado-actual.md`
- Patterns, testing, CI/CD → `docs/conventions.md`
- Architecture decisions & best practices (the *why*) → `docs/decisions.md`
- Per-screen design reference → `docs/design/screens/` (one isolated `.html` per screen — see its `README.md`)

## Working on a single screen

To work on one screen without loading the whole app: reference only that screen's design file
(`docs/design/screens/<screen>.html`) + its feature folder (`apps/web/src/features/<feature>/`) +
its endpoints (the screen→endpoint table in `docs/modules.md`). Do NOT open the full
`Wealet.dc.html` export — it's the entire app in one file and pollutes context.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
