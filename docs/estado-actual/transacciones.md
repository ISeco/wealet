# Transacciones y transferencias

## Transacciones

- Lista con filtros (`tab`, `from`, `to`, `fundId`, `categoryId`, `q`, `page`) persistidos en la URL (`useSearchParams`) y lógica extraída a `useTransactionsUrlState`. El sidebar restaura los últimos filtros guardados en `sessionStorage['tx:params']` al navegar a `/transacciones`; el botón Atrás del navegador también restaura estado.
- Exportar `.xlsx` respeta el rango de fechas filtrado (`GET /export?from=&to=`); sin filtro exporta todo.
- Selector de fondo (formulario y reasignación) y `DateInput` de filtros solo muestran fondos activos (`activeFunds()` centralizado en `funds/utils.ts`).
- `TransactionsTable` es responsive vía `grid-template-areas` con container query (`.tx-table-container`, salto a grid de 5 columnas desde 760px de ancho de *contenedor*, no de viewport — el sidebar fijo angosta el contenido real en pantallas "de escritorio" entre ~768-1050px). Por debajo de eso cada fila es una card apilada.
- Paneles flotantes (popover de Filtros, dropdown de reasignar fondo, `DateInput`) comparten `computeFloatingPosition()` (`components/ui/floatingPosition.ts`): portal + `position: fixed`, con el resultado clampeado a los bordes del viewport y `max-height`/`overflow-y` para contenido más alto que el espacio disponible.
- Usa `SegmentedTabs`/`Button`/icons compartidos; mapeo tab→`type`/`subtype` centralizado en `buildActivityQuery()` (`transactions/utils.ts`).

## Transferencias

- Transferencia entre fondos: atómica (una transacción DB, ambos lados o ninguno).
- Quick amounts (25/50/75/Todo del saldo) vía `computeQuickAmounts`; validación de monto en `validateTransferAmount` (`transfers/utils.ts`).
- Bloque Desde/Hacia responsive: fila horizontal desde 520px de ancho de contenedor, apilado debajo (mismo componente reutilizado en el formulario y en la pantalla de éxito).
- Usa `formatMoney`/`formatThousands` y `Button` compartidos — sin `Intl.NumberFormat` local.
