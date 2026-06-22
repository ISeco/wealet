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

## Code Style

- Controller → Service → Repository. Controllers never touch repositories directly.
- Money amounts are always `bigint` (minimum currency unit). Never `float`.
- Every query on a user-owned entity must filter by `userId` from `@CurrentUser()`.
- Fund balances are derived via SQL aggregation — no `balance` column on `Fund`.
- Transfers between funds are atomic — single DB transaction, both sides or neither.
- Use 2-space indentation. Prefer named exports.

## Reference Docs

- Data model → `docs/data-model.md`
- Module map & API endpoints → `docs/modules.md`
- Patterns, testing, CI/CD → `docs/conventions.md`
- Architecture decisions & best practices (the *why*) → `docs/decisions.md`
