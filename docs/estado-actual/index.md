# Estado actual

Snapshot del estado de cada feature — qué existe y cómo funciona hoy, no un historial de cómo se llegó ahí. Para el detalle de cómo se resolvió algo (bugs, intentos descartados, verificación), usar `git log`/PRs.

Un archivo por feature, alineado con `apps/web/src/features/` y `docs/modules.md`.

## Features

- [Dashboard](dashboard.md) — cards del inicio, selector de mes, runway, categorías
- [Fondos](fondos.md) — CRUD, balances, frameworks, navegación por mes
- [Transacciones y transferencias](transacciones.md) — lista, filtros, export, transferencias entre fondos
- [Salud financiera](salud.md) — frameworks de adherencia, asignación mensual
- [Autenticación](auth.md) — login/registro, Google OAuth, recuperación de contraseña
- [Ajustes](ajustes.md) — perfil, preferencias, exportar
- [Categorías](categorias.md) — CRUD + color
- [Onboarding e Import/Export](onboarding-import-export.md) — wizard inicial, importación de Excel

## Transversal

- [Infraestructura y seguridad](infraestructura.md) — deploy, DB, auditoría de seguridad, shell responsive
- [Releases](releases.md) — historial de versiones publicadas
- [Pendientes](pendientes.md) — TODOs documentados, sin resolver

## Convención al agregar una entrada nueva

Después de completar una feature, endpoint o refactor significativo: actualizar el archivo del feature correspondiente para que describa el estado *actual* (no agregar una entrada cronológica más — editar/reemplazar lo que quedó desactualizado). Si es un fix de bug menor que no cambia el comportamiento descrito, no hace falta anotarlo. Pendientes reales van a `pendientes.md`; el cierre de un release va a `releases.md`.
