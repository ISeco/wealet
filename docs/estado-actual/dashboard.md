# Dashboard

- API completa: todos los endpoints documentados están implementados, incluyendo `/reports/months` y `?month=YYYY-MM` en summary/by-category/net-worth.
- Selector de mes (`GET /reports/months`) sincroniza `PatrimonioCard`, `StatRow`, `HealthCard` y `CategoryChart`. `RunwayCard` y `NetFlowChart` son independientes del mes seleccionado. `RecentActivity` filtra por el mes activo.
- Los badges de variación (`previousTotal`/`changePercent`, `previousExpense`/`expenseChangePercent`) vienen en la misma respuesta de `/reports/net-worth` y `/reports/summary` — sin doble llamada.
- `RunwayCard`: link "Ver fondos colchón" abre `RunwayFundsDrawer`, un panel lateral para activar/desactivar `countsForRunway` por fondo con el colchón total en tiempo real. Guarda vía `PATCH /funds/:id`.
- `CategoryChart`: muestra el top 6 de categorías por gasto; "Ver todas" abre `CategoryChartDrawer` con el desglose completo (sin fetch adicional, reusa la cache de `useByCategory`).
- `HealthCard`: cuando el framework activo es `fondos` y hay más de 3 fondos, muestra los 3 con mayor saldo + link a `/salud`. Para `50/30/20` y `jars_eker` muestra todos los slots.
- `MonthSelector` (compartido con Fondos): en mobile usa una etiqueta abreviada ("Feb 2026" vía `formatMonthLabelShort`); el dropdown de meses sigue mostrando el nombre completo.
- Grids fluidos: los de 2 tarjetas usan `repeat(auto-fit, minmax(320px, 1fr))`; `StatRow` (3 tarjetas) usa container query (`.stat-row-container`/`.stat-row`, salto directo a 3 columnas desde 700px de ancho de contenedor) porque `auto-fit` con un número impar de ítems deja huecos visibles en anchos intermedios — mismo patrón reutilizado en Fondos e Import/Export.
- `DashboardPage.tsx` es composición pura (una sección por archivo); usa `Button`/icons/`formatMoney`/`classColor` compartidos, sin duplicación de `MONTH_NAMES` ni colores hardcodeados.
