# Releases

Historial de merges `dev → main`. El detalle de cada cambio vive en el feature correspondiente; esta tabla es solo el mapeo release → PR → commit.

| Versión | Fecha | PR | Merge commit | Contenido |
|---|---|---|---|---|
| v1.1.2 | 2026-07-02 | [#6](https://github.com/ISeco/wealet/pull/6) | `1b683e7` | Fix score falso 100/100 en Salud, auditoría de estandarización de Health, relocate de `app/icons.tsx` |
| v1.1.3 | 2026-07-02 | [#7](https://github.com/ISeco/wealet/pull/7) | `4aceed1` | Tabs de scope en Fondos, fix `RunwayCard` para `profit_first`, fix de puerto local de Postgres |
| v1.2.0 | 2026-07-02 | [#9](https://github.com/ISeco/wealet/pull/9) | `144ced3` | Archivado automático de fondos-slot al cambiar de framework, hallazgos de revisión de `provisionFrameworkFunds`, fix de aviso de archivado en Fondos Propios |
| v1.3.0 | 2026-07-02 | [#10](https://github.com/ISeco/wealet/pull/10) | `f617538` | Auditoría de estandarización de Fondos, botón eliminar movido al detalle |
| v1.4.0 | 2026-07-02 | [#11](https://github.com/ISeco/wealet/pull/11) | `c433886` | Auditoría de estandarización de Transacciones (`SegmentedTabs`), extracción de lógica de `TransactionsPage` |
| v1.5.0 | 2026-07-02 | [#12](https://github.com/ISeco/wealet/pull/12) | `1c03427` | Auditoría de estandarización de Transfers/Settings/Auth/Dashboard/Onboarding/Import-export, eliminación de dead code |
| v1.5.1 | 2026-07-03 | [#13](https://github.com/ISeco/wealet/pull/13) | `4687c9c` | Tres fixes del parser de import Excel (fila de totales, tope calendario, saldo con decimales), logging de stack trace en `HttpExceptionFilter` |
| v1.6.0 | 2026-07-06 | [#26](https://github.com/ISeco/wealet/pull/26) | `d5bafa0` | Pase completo de responsive design (todas las pantallas), fix de `AllocationDrawer` con framework obsoleto, paginación en movimientos del fondo, fix de re-preguntar ingreso mensual en onboarding |
| v1.7.0 | 2026-07-13 | [#29](https://github.com/ISeco/wealet/pull/29) | `3418a88` | Auditoría de seguridad Cyber Neo y remediación (helmet, rate limiting, `xlsx`→`exceljs`, JWT algorithm pin, etc.), migración de `PASSWORD_PEPPER` sin bloquear usuarios existentes |
| v1.8.0 | 2026-07-22 | [#32](https://github.com/ISeco/wealet/pull/32) | `660f9c7` | Navegación por mes en el detalle del fondo, fixes de UI en `MonthSelector` |
| v1.9.0 | 2026-07-25 | [#34](https://github.com/ISeco/wealet/pull/34) | `452eae5` | Transacciones en moneda extranjera (USD/EUR → CLP): `base_currency` por usuario, conversión server-side (`convertToBase`), proxy `GET /exchange-rate` a mindicador.cl (best-effort), `original_*` en `/activity` y nota de procedencia en la tabla, ADR-09 (proxy con `fetch` nativo) |
| v1.9.1 | 2026-08-01 | [#37](https://github.com/ISeco/wealet/pull/37) | `c250218` | Fix del drawer de asignación mensual (ya no salta el paso de ingreso con el monto del mes anterior), eliminación del editor de ingreso duplicado en `ScoreCard` (el score depende solo de la distribución real), `graphify-out/` deja de estar versionado |
| v1.9.2 | 2026-08-05 | [#38](https://github.com/ISeco/wealet/pull/38) | `362cef4` | Fix del dropdown de mes recortado en `FundDetail` cuando la tabla de movimientos está vacía (`overflow: hidden` de la tarjeta clipeaba el `MonthSelector` del header) |

**Hotfix directo a `main`**: PR #28 (`hotfix/password-pepper-rotation`) — cherry-pick de la rotación de `PASSWORD_PEPPER` sin esperar al release normal de `dev`, por una ventana breve de login roto tras rotar la credencial en Render antes de que el código de fallback llegara a producción.

**Anteriores a v1.1.2** (`v1.0.0`, `v1.1.0`, `v1.1.1`): no cubiertas por el historial detallado disponible — corresponden a los PR #1/#3/#5, previas a las entradas conservadas en este resumen.
