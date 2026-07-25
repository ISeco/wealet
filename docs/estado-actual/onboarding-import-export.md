# Onboarding e Import/Export

## Onboarding

- Wizard full-screen de 3 pasos: preset → fondos → éxito. Presets: `jars_eker`, `50_30_20`, `profit_first` (Profit First — Estilo de Vida/Diversión/Inversión/Seguridad), fondos propios, y el camino Excel (embebe upload+preview de Import sin salir del wizard).
- `ProtectedRoute` redirige a `/onboarding` si `onboardingCompleted = false`.
- Salta el paso de ingreso mensual si ya hay uno registrado ese mes (`currentAllocation.totalAmount` o `HealthProfile.monthlyIncome`), tanto en alta inicial como al reconfigurar con un framework distinto — muestra una nota informativa con el monto que se va a reutilizar.
- Lógica del wizard (steps, validaciones, cálculo de progreso) vive en `hooks/useOnboardingFlow.ts`; `OnboardingPage.tsx` es composición pura.

## Import/Export

- `/import`: wizard 3 pasos — upload → preview (stats + tabla + sección de fondos desconocidos con checkboxes) → éxito. Filas de fondos no aprobados se excluyen del commit. Export `.xlsx` vive en Ajustes.
- Flujo de subir Excel + preguntar año compartido entre `/import` y el paso Excel del onboarding vía `useExcelImportFlow` (lógica pura en `importFlow.utils.ts`).
- Parser (`excel-ledger.parser.ts`, sobre `exceljs`):
  - Detecta el mes por palabra en cualquier parte del nombre de hoja (no exige el patrón exacto "mes año"); pide el año al usuario (`needsYear`) si la hoja no lo trae.
  - Acota el rango de filas de datos por la posición real de la fila "Total c/u" (buscada por texto, no por columna fija); si no la encuentra, usa como fallback los días reales del mes.
  - Calcula el ingreso mensual redistribuido a cada fondo mes a mes (delta entre la fila 3 y el "Total c/u" del mes anterior) — no solo el saldo inicial del primer mes.
  - Redondea montos con decimales antes de insertar (la columna `amount` es `bigint`).
  - Patch propio de `exceljs` (`patches/exceljs.patch`, vía `pnpm patch`, se reaplica en cada `pnpm install`) para leer comentarios de celda sin rich-text y valores numéricos de celdas con fórmula (`{formula, result}`); quita el prefijo automático "Nombre:\n" que agrega Excel a los comentarios.
- Responsive: stats y tabla de preview usan el mismo container query que Transacciones/Dashboard; botones finales con `flexWrap`.
