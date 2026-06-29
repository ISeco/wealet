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
- **Monthly Allocation implementado**: POST/GET `/monthly-allocation/current` crea distribución del ingreso mensual como N transacciones de ingreso (una por fondo activo)
- `getFondosAssessment` eliminado — todos los frameworks (incluido `fondos`) usan `getFlowAssessment` para medir adherencia por flujo del período
- **Frontend**: AllocationChip (teal, junto a FrameworkTabs), AllocationDrawer (lateral 460px), dot en sidebar nav "Salud financiera" (color `--disp`, sin animación, se muestra cuando no hay distribución del mes)
- **Re-distribución del mes**: reemplaza transacciones anteriores del mismo `MonthlyAllocation` sin crear duplicados
- **AllocationDrawer — inputs con separador de miles**: inputs de ingreso y distribución cambiados de `type="number"` a `type="text" inputMode="numeric"`. Usan `formatThousands` de `money.ts` para display; almacenan solo dígitos. `formatCLP` interno usa `formatThousands` en lugar de `Number().toLocaleString`.
- **GET /monthly-allocation/current — fix null response**: NestJS/Express omitía el body cuando el controller retornaba `null` (llamaba `res.send()` sin cuerpo). Corregido usando `@Res()` y `res.json(allocation)` explícito para enviar JSON `null` literal. Sin este fix React Query recibía body vacío, fallaba el parse y `data` quedaba `undefined` (dot nunca aparecía).
- **AdherenceChart — unificación de semántica**: eliminado el branch `isFondos` que mostraba "saldo como % del total" para fondos propios. Todos los frameworks usan flujo del período. Subtítulo y empty label unificados.
- **AdherenceChart — visualización de flujo negativo**: barras con `actualPercentage < 0` se clampeaban a `width: "-X%"` (CSS inválido, se veía como track lleno). Corregido con `Math.max(0, ...)`. Fondos con flujo negativo muestran barra ámbar + monto ámbar. Marcador y etiqueta "Meta" se ocultan cuando `targetPercentage === 0`.
- **GET /health/assessment — fix porcentajes inflados**: el SQL incluía transferencias entre fondos en el flujo por fondo pero no en el `totalIncome` base. Esto provocaba porcentajes > 100% en fondos que recibían transferencias. Corregido eliminando los dos `UNION ALL` de transferencias — el assessment ahora solo cuenta transacciones (income/expense), coherente con el denominador.
- **Transacciones — fix fondos archivados**: el selector de fondo en `TransactionFormModal` y el dropdown de reasignación en `TransactionsTable` mostraban fondos archivados. Corregido filtrando `fund.archivedAt === null` en ambos lugares.
- **Backend auditado** (rama `dev`, 2026-06-29): revisión módulo por módulo — calidad de código + unit tests. Resultados:
  - `common/`: `HttpExceptionFilter` global creado → shape de error uniforme `{ statusCode, message, error, timestamp, path }` en toda la API.
  - `auth/`: rechaza cambio a contraseña igual que la actual (`BadRequestException`); 3 tests nuevos (changePassword, email enumeration).
  - `funds/`: 5 tests nuevos (balance derivado, soft-delete, createPreset transaccional).
  - `transactions/`: spec creado desde cero — 9 tests (userId filter, filtros opcionales, paginación, SQL injection).
  - `health/`: spec creado desde cero — 5 tests (assessment percentages, monthlyIncome fallback, framework seeding).
  - `reports/`: sin cambios — SQL parametrizado, guard de división por cero, nombres descriptivos ya en orden.
  - `activity/`: **bug corregido** — `fundId` filter en el UNION excluía todas las transferencias; corregido con `OR from_fund_id = $7 OR to_fund_id = $7`.
  - `import-export/`: 2 tests nuevos (nombre de hoja inválido, celda no numérica).
  - `transfers/`: test de fondo destino no autorizado agregado.
  - `monthly-allocation/`: **bug corregido** — `fundsRepo.find` no filtraba `archivedAt IS NULL`; añadido para evitar distribuciones a fondos archivados. Test correspondiente agregado.
- **Pre-auditoría — pendientes documentados**:
  - *Autenticación con Google (pendiente)*: el botón "Continuar con Google" en la pantalla de auth está presente pero no implementado. Requiere: (1) agregar `googleId text null` al modelo `User` + migración, (2) módulo `auth/google` en NestJS con `passport-google-oauth20`, (3) callback route `GET /auth/google/callback`, (4) flujo en el frontend con redirect/popup. Evaluar si usar Firebase Auth o Passport directamente.
  - *Recuperación de contraseña (pendiente)*: no existe flujo "olvidé mi contraseña". Requiere: (1) agregar `passwordResetToken text null` + `passwordResetExpiresAt timestamptz null` al modelo `User` + migración, (2) endpoints `POST /auth/forgot-password` y `POST /auth/reset-password` en NestJS, (3) servicio de email con Brevo (API gratuita) + plantillas HTML acordes a la estética de la app, (4) pantalla `/reset-password?token=` en el frontend.

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
