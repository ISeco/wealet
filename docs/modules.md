# Modules & API

## Backend module map (`apps/api/src/`)

```
common/
  decorators/       @CurrentUser()
  guards/           JwtAuthGuard
  interceptors/     logging, transform-response
  filters/          HttpExceptionFilter  ← single error shape for the whole API
  pipes/            ValidationPipe global (whitelist: true, forbidNonWhitelisted: true)
  money/            Money helper (format, parse by currency)
config/             env validation (joi), typeorm datasource
database/
  migrations/       all schema changes live here — synchronize: false always
modules/
  auth/             register, login, refresh, logout; argon2; JWT; rotating refresh
  users/            user profile
  funds/            CRUD + derived balance query per fund
  categories/       CRUD + system category seed
  transactions/     CRUD, filters, pagination
  transfers/        atomic reallocation between funds
  reports/          read-only aggregations: summary, by-category, net-worth, runway
  import-export/    SheetJS parse → preview → commit (with dedupe); export
  health/           framework adherence (50/30/20, Jars of Eker, fondos)
test/               e2e tests (supertest)
```

---

## API Endpoints

Base path: `/api/v1`. Swagger at `/api/docs`.

```
Auth
  POST  /auth/register
  POST  /auth/login         → { accessToken } + set-cookie refresh
  POST  /auth/refresh       → rotates refresh, issues new access token
  POST  /auth/logout        → revokes refresh token

Transactions
  GET    /transactions?from=&to=&type=&categoryId=&fundId=&page=&limit=
  POST   /transactions
  GET    /transactions/:id
  PATCH  /transactions/:id
  DELETE /transactions/:id

Funds
  GET    /funds                   → list with derived balance per fund
  POST   /funds
  PATCH  /funds/:id
  DELETE /funds/:id               → soft archive if fund has movements

Transfers
  GET    /transfers?from=&to=
  POST   /transfers               → atomic debit + credit between funds

Categories
  GET    /categories
  POST   /categories
  PATCH  /categories/:id
  DELETE /categories/:id

Reports (read-only, aggregated in SQL)
  GET  /reports/summary?from=&to=         → balance, income, expenses
  GET  /reports/by-category?from=&to=     → breakdown for chart
  GET  /reports/net-worth                 → available / reserve / committed
  GET  /reports/runway                    → months of runway (cushion ÷ burn)

Import / Export
  POST /import/preview    (multipart) → parsed rows, errors, duplicates flagged
  POST /import/commit                 → persists confirmed rows
  GET  /export?from=&to=              → .xlsx download

Health
  GET  /health/profile
  PUT  /health/profile
  GET  /health/assessment?from=&to=   → adherence to selected framework
```

### API conventions
- Errors: `{ statusCode, message, error, timestamp, path }` via `HttpExceptionFilter`
- DTOs: `class-validator` + `class-transformer`; global `ValidationPipe`
- Reports: aggregate with `GROUP BY` in SQL — never fetch all rows and sum in Node

---

## Frontend structure (`apps/web/src/`)

```
app/              router, providers
lib/
  api/            fetch client + refresh interceptor (retries once on 401)
  money.ts        format amounts by currency
features/
  auth/           login, register, route guard
  transactions/   list, filters, create/edit form
  dashboard/      summary cards + Recharts charts
  import-export/  file uploader + preview table
  health/         framework adherence visual
components/ui/    reusable UI components
```

- **TanStack Query (React Query)** for all server state. No Redux.
- Local UI state with `useState` only.
- Shared types from `packages/shared`.
