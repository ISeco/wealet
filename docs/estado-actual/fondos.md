# Fondos

- CRUD completo. Balance derivado por agregación SQL — sin columna `balance` en `Fund`.
- `/fondos` tiene tabs de scope **Todas / Del framework / Propios**, filtrado 100% client-side por `frameworkSlot !== null` (mismo patrón que Categorías). Todos los fondos se siguen trayendo con `useFunds()`, sin filtro server-side — un framework nunca oculta los fondos propios del usuario.
- Cambio de framework (`HealthService.provisionFrameworkFunds`, transaccional): archiva los fondos-slot del framework saliente y reactiva (misma fila, mismo historial) o crea los del entrante. Restaura `isOperative` desde el template al reactivar; preserva `name`/`classification`/`targetPercentage`/`countsForRunway` que el usuario haya customizado. Colisión de nombre con un fondo activo se traduce a `409 Conflict`. El índice único de nombre de fondo aplica a *todos* los fondos activos (no solo propios) — archivar libera el nombre.
- `POST /funds/preset` (onboarding, incluido "Reconfigurar fondos" desde Ajustes) delega en el mismo `provisionFrameworkFunds`, sin templates propios duplicados.
- Botón eliminar vive en el header de `FundDetail.tsx` (junto a "Editar"), no en el drawer de edición. `FundFormDrawer` es solo create/edit.
- `FundDetail.tsx` navega por mes reutilizando `MonthSelector` del Dashboard. Endpoint dedicado `GET /transactions/months?fundId=` — a diferencia de `/reports/months` (global, tope 12 meses), es scoped al fondo, sin tope de antigüedad, y siempre incluye el mes actual aunque esté vacío. Lista de movimientos paginada (10/página).
- `GET /reports/runway` excluye fondos archivados.
- Responsive: resumen por clasificación usa el mismo container query de `StatRow`; el grid `FundHeaderCard`+`FundStatsColumn` usa `auto-fit`/`minmax(320px,1fr)` (con 2 ítems no hay estado intermedio con hueco).
- Usa `Button`/`SegmentedTabs`/icons/`classColor()` compartidos; `CLASS_ORDER` y `MONTH_NAMES` centralizados (sin arrays locales duplicados).
