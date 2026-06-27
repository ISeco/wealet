# Modules & API

## Estado actual

- **API completa**: todos los endpoints documentados están implementados. Incluye `/reports/months` y `?month=YYYY-MM` en summary / by-category / net-worth para el selector de mes del dashboard.
- **Frontend funcional end-to-end**: auth, funds, transactions, transfers, categories, health. El dashboard solo tiene la HealthCard activa; el resto de las cards son placeholder "Próximamente".
- **Frontend pendiente**: onboarding e import-export no están construidos. Los endpoints de API que necesitan ya existen y están testeados.
- **Settings implementado**: pantalla `/ajustes` completa — perfil (displayName editable, cambiar contraseña con logout automático), framework por defecto, runway fund toggles, tema claro/oscuro, exportar .xlsx. Botones Importar y Reconfigurar fondos deshabilitados hasta que esas pantallas existan. Se agregó `refetchUser()` al `AuthContext` para que el sidebar refleje el nombre actualizado sin recargar.
- **Health — cambio de modelo**: el campo `config` jsonb fue eliminado de `HealthProfile`. Los targets del framework viven como `frameworkSlot` + `targetPercentage` en cada `Fund`, sembrados automáticamente al cambiar de framework. El patrón Strategy fue evaluado y eliminado; la lógica es inline en `health.service.ts`.
- **Health — recomendaciones (pendiente IA)**: la sección "Recomendaciones" de la pantalla `salud` está temporalmente oculta. La lógica estática (`getRecommendations`, `RecommendationCards`, `RECS` en `utils.ts`) existe pero no se renderiza. La intención es reemplazarla con recomendaciones personalizadas generadas por un LLM a partir del comportamiento financiero real del usuario (assessment + historial de transacciones). No eliminar los archivos existentes — son la base de la futura integración.
- **Import/Export**: API completa (preview → commit con dedupe → export .xlsx); pantalla frontend sin construir.

---

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
  activity/         unified paginated timeline: transactions + transfers via SQL UNION
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
  POST  /auth/login            → { accessToken } + set-cookie refresh
  POST  /auth/refresh          → rotates refresh, issues new access token
  POST  /auth/logout           → revokes refresh token
  POST  /auth/change-password  → requires JWT; revokes all refresh tokens (Ajustes)

Users
  GET    /users/me             → profile: id, email, displayName, theme, onboardingCompleted(At)
  PATCH  /users/me             → update displayName / theme / onboardingCompleted

Transactions
  GET    /transactions?from=&to=&type=&categoryId=&fundId=&q=&page=&limit=
  POST   /transactions
  GET    /transactions/:id
  PATCH  /transactions/:id
  DELETE /transactions/:id

Funds
  GET    /funds                   → list with derived balance per fund
  GET    /funds/:id               → single fund detail
  GET    /funds/:id/history?months=12   → balance evolution (detail chart)
  POST   /funds
  POST   /funds/preset            → create preset (sobres/Jars/50-30-20) atomically (onboarding)
  PATCH  /funds/:id
  DELETE /funds/:id               → soft archive if fund has movements

Transfers
  GET    /transfers?from=&to=&page=&limit=
  POST   /transfers               → atomic debit + credit between funds

Activity (unified timeline — transactions + transfers merged and paginated server-side)
  GET    /activity?from=&to=&type=transaction|transfer&subtype=income|expense&fundId=&categoryId=&q=&page=&limit=
         → { data: ActivityItem[], total, page, limit }
         ActivityItem: { type, id, amount, amountFormatted, currency, occurredOn, createdAt,
                         description?, subtype?, fundId?, categoryId?, source?, updatedAt?,  ← transaction fields
                         fromFundId?, toFundId?, note? }                                      ← transfer fields

Categories
  GET    /categories
  POST   /categories
  PATCH  /categories/:id
  DELETE /categories/:id

Reports (read-only, aggregated in SQL)
  GET  /reports/months                    → meses con datos en los últimos 12 meses (YYYY-MM[], DESC), para selector del dashboard
  GET  /reports/summary?from=&to=         → balance (puntual al `to`), income, expenses del período
         ?month=YYYY-MM                   → alternativa a from/to; balance e income/expense puntuales al mes
  GET  /reports/by-category?from=&to=    → breakdown for chart
         ?month=YYYY-MM                   → alternativa a from/to
  GET  /reports/net-worth                 → available / reserve / committed (balances acumulados todo el tiempo)
         ?month=YYYY-MM                   → punto en el tiempo: balances hasta el último día del mes
  GET  /reports/runway                    → months of runway (cushion ÷ burn)
  GET  /reports/cash-flow?months=12       → monthly net flow (dashboard bars), excludes transfers

Import / Export
  POST /import/preview    (multipart) → parsed rows, errors, duplicates flagged
  POST /import/commit                 → persists confirmed rows
  GET  /export?from=&to=              → .xlsx download

Health
  GET  /health/profile
  PUT  /health/profile
  GET  /health/assessment?[from=&to=] → adherence to selected framework; from/to requeridos solo para 50/30/20 y jars_eker (miden flujo); fondos usa balances acumulados e ignora el rango
```

### API conventions
- Errors: `{ statusCode, message, error, timestamp, path }` via `HttpExceptionFilter`
- DTOs: `class-validator` + `class-transformer`; global `ValidationPipe`
- Reports: aggregate with `GROUP BY` in SQL — never fetch all rows and sum in Node

---

## Frontend structure (`apps/web/src/`)

```
app/              router, providers, AppLayout (Sidebar + TopBar shell)
lib/
  api/            fetch client + refresh interceptor (retries once on 401)
  money.ts        format amounts by currency
features/
  auth/           login, register, route guard
  dashboard/      summary cards + Recharts charts  ← cards en placeholder "Próximamente"; solo HealthCard activa
  funds/          fund list + detail (balance history)
  transactions/   list, filters, create/edit form
  transfers/      move money between funds (A→B)
  categories/     CRUD + color
  health/         framework adherence visual; selector de mes convierte YYYY-MM → from/to en cliente
  [pendiente] onboarding/     preset / import-Excel wizard
  [pendiente] import-export/  file uploader + preview table
  settings/                   profile, prefs, theme, runway toggles, export
components/ui/    reusable UI components
```

- **TanStack Query (React Query)** for all server state. No Redux.
- Local UI state with `useState` only.
- Shared types from `packages/shared`.

---

## Screen → endpoints

Design reference per screen lives in `docs/design/screens/` (one isolated `.html` each).

| Screen (`features/`) | Endpoints |
|---|---|
| auth | `POST /auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout` |
| onboarding | `POST /funds/preset`; (Excel path) `POST /import/preview`, `/import/commit`; `PATCH /users/me`; `PUT /health/profile` |
| dashboard | `GET /reports/months`, `/reports/summary`, `/reports/net-worth`, `/reports/runway`, `/reports/cash-flow`, `/reports/by-category`, `/health/assessment`, `/transactions?limit=`, `/funds` |
| funds | `GET /funds`, `/funds/:id`, `/funds/:id/history`, `/transactions?fundId=`, `POST /funds` (drawer "Nuevo fondo"), `PATCH /funds/:id`, `DELETE /funds/:id` |
| transactions | `GET /activity` (+filters, `?type=transaction\|transfer` para filtrar por tab; `?subtype=income\|expense` para tabs de tipo), `POST/GET/PATCH/DELETE /transactions/:id` (`PATCH` también reasigna fondo desde la fila), `GET /funds` (opciones del reassign por fila) |
| categories | `GET /categories` (devuelve todas; filtro mine/system/all es client-side vía `isSystem`), `POST /categories` (drawer Nueva), `PATCH /categories/:id` (drawer Editar), `DELETE /categories/:id` (solo propias), `GET /reports/by-category` |
| transfers | `POST /transfers`, `GET /funds` |
| health | `GET /health/assessment`, `GET/PUT /health/profile` |
| import-export | `POST /import/preview`, `/import/commit`, `GET /export` |
| settings | `GET/PATCH /users/me`, `POST /auth/change-password`, `PATCH /funds/:id` (countsForRunway), `PUT /health/profile`, `GET /export` |

Endpoints marcados `[pendiente]` están planificados pero aún no implementados en la API.
