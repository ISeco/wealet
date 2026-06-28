# Spec: Pantalla Importar Excel

**Fecha:** 2026-06-27
**Feature:** `apps/web/src/features/import-export/`
**Ruta:** `/import`
**Endpoints:** `POST /import/preview`, `POST /import/commit`
**Diseño de referencia:** `docs/design/screens/import.html`

---

## Contexto

La API de import/export ya está completa y testeada. Falta únicamente la pantalla frontend. El flujo es un wizard de 3 pasos: subir archivo → preview con confirmación → pantalla de éxito.

El caso especial que define el diseño: el Excel puede referenciar fondos que el usuario aún no tiene en su cuenta. El backend los auto-crearía en el commit, pero el usuario debe poder decidir cuáles aprobar. Los fondos no aprobados simplemente excluyen sus filas del commit.

---

## Arquitectura

### Enfoque: página liviana + componentes por paso

`ImportPage.tsx` es dueño de todo el estado compartido del wizard. Cada paso es un componente independiente que recibe props y dispara callbacks. Sigue el patrón de sección-extraction del proyecto (`conventions.md`).

### Estructura de archivos

```
features/import-export/
  api.ts                     ← importPreview(file), importCommit(rows)
  hooks.ts                   ← useImportPreview(), useImportCommit()
  types.ts                   ← mirrors de los DTOs del backend
  ImportPage.tsx             ← estado compartido + composición de pasos
  components/
    StepIndicator.tsx        ← numeritos del wizard, sin lógica
    UploadStep.tsx           ← drag & drop + file picker
    PreviewStep.tsx          ← stats + tabla + fondos desconocidos + banner
    UnknownFundsSection.tsx  ← checkboxes colapsables (estado local: expanded)
    SuccessStep.tsx          ← pantalla de éxito
  index.ts
```

---

## Estado compartido (`ImportPage`)

```ts
step: 1 | 2 | 3
file: File | null
previewData: ImportPreviewResponseDto | null
approvedFunds: Set<string>      // fondos desconocidos aprobados por el usuario
commitResult: ImportCommitResultDto | null
```

`approvedFunds` se inicializa con **todos** los fondos desconocidos pre-chequeados (opt-out). El usuario desmarca los que no quiere crear.

---

## Flujo paso a paso

### Paso 1 — Subir archivo

- Drop zone + `<input type="file" accept=".xlsx,.csv">` oculto
- Al soltar o seleccionar un archivo: validar extensión (`.xlsx` / `.csv`) antes de llamar al backend
  - Extensión inválida → mensaje de error inline dentro de la drop zone (no toast)
- Archivo válido → disparar `POST /import/preview` inmediatamente (sin botón "Continuar" separado)
- Durante el upload: spinner, drop zone deshabilitada
- Éxito → `previewData` se setea, `approvedFunds` se inicializa con todos los `unknownFunds`, `step → 2`

### Paso 2 — Preview y confirmación

**Stats cards (3):**
- Válidas: `rows.filter(r => !r.duplicate).length`
- Duplicadas: `rows.filter(r => r.duplicate).length`
- Con errores: `errors.length` (errores de parseo a nivel celda; esas filas no están en `rows[]`)

**Tabla de filas:**

| Columna | Fuente |
|---|---|
| Fecha | `row.occurredOn` |
| Descripción | `row.description` |
| Monto | `row.amount` formateado + color por `row.type` |
| Fondo | `row.fundName` |
| Estado | badge calculado (ver abajo) |

Badge por fila:
- `duplicate: true` → badge "Duplicada" (warn), fondo `--warn-bg`, opacity 0.6
- `fundName` en `unknownFunds` y **no** en `approvedFunds` → badge "Se omitirá" (muted), opacity 0.5 — actualización reactiva al desmarcar
- resto → badge "Válida" (pos)

**Sección fondos desconocidos** (solo si `unknownFunds.length > 0`):

Tarjeta con borde `--warn`, fondo `--warn-bg`. Checkbox por cada fondo desconocido.
- ≤3 fondos: todos visibles
- >3 fondos: primeros 3 visibles + botón "Ver X más ↓" que expande el resto inline (estado local `expanded` en `UnknownFundsSection`)

Desmarcar un fondo actualiza `approvedFunds` en `ImportPage` → las filas de ese fondo en la tabla cambian reactivamente a "Se omitirá".

**Banner de advertencia** (texto dinámico):
> "Se importarán **N transacciones**. X duplicadas se omiten[. Y filas se omitirán por fondos no aprobados.]"

La parte de fondos solo aparece si hay fondos desmarcados. `N` = filas válidas cuyos fondos están aprobados.

**Botones:**
- "← Volver" → resetea `file`, `previewData`, `approvedFunds`, `step → 1`
- "Confirmar e importar N" → filtra `rows` excluyendo duplicados y filas con fondos no aprobados → `POST /import/commit` → `step → 3`

### Paso 3 — Éxito

- Título personalizado con `displayName` del usuario (via `AuthContext`)
- Muestra `commitResult.imported` (transacciones importadas)
- Si `commitResult.createdFunds.length > 0`: "Se crearon X fondos nuevos."
- Botón "Importar otro" → resetea todo el estado a valores iniciales, `step → 1`
- Botón "Ver transacciones" → navega a `/transacciones`

---

## API

### `api.ts`

```ts
// importPreview: construye FormData y hace POST multipart
importPreview(file: File): Promise<ImportPreviewResponseDto>

// importCommit: envía las filas filtradas
importCommit(rows: ImportRowDto[]): Promise<ImportCommitResultDto>
```

El export (`GET /export`) ya existe en `features/settings/api.ts` y no se toca.

### `hooks.ts`

```ts
useImportPreview()   // useMutation — llama importPreview
useImportCommit()    // useMutation — llama importCommit
```

Ambas mutaciones son independientes (no invalidan queries de otras features — los balances de fondos se actualizan al navegar a fondos/transacciones normalmente via React Query).

---

## Tipos (`types.ts`)

Mirrors directos de los DTOs del backend. Sin transformaciones.

```ts
type ImportRowDto = { sheet, cell, fundName, amount, type, description, occurredOn, dedupeHash, duplicate? }
type ImportPreviewResponseDto = { rows, openingBalances, unknownFunds, errors }
type ImportCommitResultDto = { imported, skippedDuplicates, createdFunds }
type ParseErrorDto = { sheet, cell, message }
```

---

## Routing e integración

- Nueva ruta `/import` en `router.tsx` dentro del `AppLayout` (lazy import)
- `navConfig.ts`: quitar `disabled: true` del ítem "Importar Excel"
- Agregar `/import` a `pageTitles` en `navConfig.ts`: `{ crumb: 'Sistema', title: 'Importar Excel' }`

---

## Lo que no entra en scope

- Pantalla de export standalone (el export .xlsx ya existe en Ajustes)
- Previsualización de `openingBalances` en la UI (la API los devuelve pero no hay diseño para mostrarlos)
- Paginación de la tabla de preview
- Asignación manual de categoría por fila importada (las filas importadas usan la categoría "Importado" automáticamente)
