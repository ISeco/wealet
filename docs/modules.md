# Modules & API

## Estado actual

- **API completa**: todos los endpoints documentados están implementados. Incluye `/reports/months` y `?month=YYYY-MM` en summary / by-category / net-worth para el selector de mes del dashboard.
- **Dashboard implementado**: todas las cards activas. Selector de mes (GET /reports/months) sincroniza PatrimonioCard, StatRow, HealthCard y CategoryChart. RunwayCard y NetFlowChart son independientes del mes seleccionado. RecentActivity filtra por el mes activo. Backend extiende /reports/net-worth y /reports/summary con datos del mes anterior (previousTotal/changePercent y previousExpense/expenseChangePercent) para los badges de variación — sin doble llamada.
- **Frontend funcional end-to-end**: auth, funds, transactions, transfers, categories, health, dashboard.
- **Frontend pendiente**: onboarding e import-export no están construidos. Los endpoints de API que necesitan ya existen y están testeados.
- **Settings implementado**: pantalla `/ajustes` completa — perfil (displayName editable, cambiar contraseña con logout automático), framework por defecto, runway fund toggles, tema claro/oscuro, exportar .xlsx. Botones Importar y Reconfigurar fondos deshabilitados hasta que esas pantallas existan. Se agregó `refetchUser()` al `AuthContext` para que el sidebar refleje el nombre actualizado sin recargar.
- **Health — cambio de modelo**: el campo `config` jsonb fue eliminado de `HealthProfile`. Los targets del framework viven como `frameworkSlot` + `targetPercentage` en cada `Fund`, sembrados automáticamente al cambiar de framework. El patrón Strategy fue evaluado y eliminado; la lógica es inline en `health.service.ts`.
- **Health — recomendaciones (pendiente IA)**: la sección "Recomendaciones" de la pantalla `salud` está temporalmente oculta. La lógica estática (`getRecommendations`, `RecommendationCards`, `RECS` en `utils.ts`) existe pero no se renderiza. La intención es reemplazarla con recomendaciones personalizadas generadas por un LLM a partir del comportamiento financiero real del usuario (assessment + historial de transacciones). No eliminar los archivos existentes — son la base de la futura integración.
- **Import/Export**: pantalla `/import` implementada. Wizard 3 pasos: upload → preview (stats + tabla de filas + sección fondos desconocidos colapsable con checkboxes) → éxito. El usuario controla qué fondos desconocidos aprobar; filas de fondos no aprobados se excluyen del commit. Export .xlsx sigue en Ajustes.
- **Transacciones — bugs corregidos**: (1) lista no se refrescaba tras editar/eliminar — mutations no invalidaban `['activity']`; corregido agregando invalidación a los tres hooks. (2) fecha no se pre-poblaba al editar — `occurredOn` venía como ISO completo (`T04:00:00.000Z`) y se pasaba directo al `<input type="date">`; corregido con `.slice(0, 10)`. (3) filas reordenaban al editar categoría — consecuencia del bug de fecha anterior.
- **Transacciones — filtros persistentes por URL**: `tab`, `from`, `to`, `fundId`, `categoryId`, `q` y `page` viven en search params (`useSearchParams`). El sidebar restaura los últimos params guardados en `sessionStorage['tx:params']` al navegar a `/transacciones`. Botón Atrás del browser también restaura el estado.
- **Transacciones — DateInput consistente**: los inputs de fecha del panel de filtros usan el mismo componente `DateInput` custom (calendario popup en español) que el formulario de edición. Se agregó prop `placeholder` opcional al componente (default: `'Selecciona una fecha'`); el filtro usa `'Desde'` / `'Hasta'`. Se corrigió desbordamiento del calendario cuando el trigger está cerca del borde derecho del viewport — ahora se alinea al borde derecho del trigger si no cabe a la izquierda.
- **Transacciones — exportar**: botón Exportar habilitado en la toolbar. Llama `GET /export?from=&to=` con los filtros de fecha activos y descarga el `.xlsx`. Sin fechas filtradas exporta todo. El nombre del archivo incluye el rango si hay filtro activo (`wealet-export-YYYY-MM-DD-YYYY-MM-DD.xlsx`).
- **Dashboard — RecentActivity filtra por mes**: el componente `RecentActivity` acepta el mes activo y pasa `from`/`to` al endpoint `/activity`. Antes era independiente del selector de mes.
- **Dashboard — HealthCard top-3 para Fondos**: cuando el framework activo es `fondos` y el usuario tiene más de 3 fondos, el card muestra los 3 con mayor saldo (`actualAmount` DESC) y un pie con "+N fondos más / Ver todos" que lleva a `/salud`. Para `50/30/20` y `jars_eker` sigue mostrando todos los slots.
- **Dashboard — RunwayCard con gestión de fondos colchón**: el `RunwayCard` muestra un link "Ver fondos colchón (N)" al pie que abre un drawer lateral (`RunwayFundsDrawer`). El drawer lista todos los fondos activos — primero los que tienen `countsForRunway: true` — con toggle por fila para activar/desactivar su participación en el runway. El footer del drawer muestra el colchón total en tiempo real. Cambios se guardan vía `PATCH /funds/:id` inmediatamente; invalida `['funds']` y `['reports', 'runway']` para mantener el card sincronizado. Sin cambios en la API.
- **Dashboard — CategoryChart con drawer de desglose completo**: el `CategoryChart` muestra el top 6 de categorías por gasto. Cuando hay más de 6, aparece "+N categorías más / Ver todas" al pie. "Ver todas" abre `CategoryChartDrawer` — drawer de solo lectura con todas las categorías del mes ordenadas por monto, mismas barras proporcionales, y footer con el gasto total del mes en BigInt. Sin fetch adicional (datos ya en cache de `useByCategory`).
- **Transacciones — ConfirmDialog en eliminar**: el botón de eliminar en `TransactionFormModal` usaba `window.confirm` nativo. Reemplazado por el componente `ConfirmDialog` estilizado, consistente con el patrón ya usado en `FundFormDrawer`.
- **Onboarding implementado**: wizard full-screen de 3 pasos — selección de preset (jars_eker, 50/30/20, profit_first, fondos propios, Excel), preview de fondos, pantalla de éxito. `ProtectedRoute` redirige a `/onboarding` si `onboardingCompleted = false`. El preset `sobres` fue renombrado a `profit_first` (Profit First, basado en Mike Michalowicz) con fondos Estilo de Vida / Diversión / Inversión / Seguridad, slots predefinidos y framework de salud propio. jars_eker nombres sincronizados entre `fund-presets.ts` y `framework-funds.ts`. El camino Excel embebe `UploadStep` + `PreviewStep` del feature de import sin redirigir fuera del wizard. Empty states pendientes de mejorar en `/transferencias` (formulario sin fondos) y `/salud` (sin datos de assessment).
- **POST /funds/preset**: acepta `profit_first` como valor de preset. El valor `sobres` fue eliminado del enum.

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
  health/           framework adherence (50/30/20, Jars of Eker, Profit First, fondos)
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
  POST   /funds/preset            → create preset (jars_eker / 50_30_20 / profit_first) atomically (onboarding)
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
  onboarding/      wizard 3 pasos: preset → fondos → éxito (Excel path embebe import)
  import-export/   file uploader + preview table
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
