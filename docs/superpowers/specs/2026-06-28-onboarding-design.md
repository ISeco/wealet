# Onboarding — Spec

**Fecha:** 2026-06-28

## Resumen

Wizard full-screen de 3 pasos que se muestra a todo usuario autenticado con `onboardingCompleted = false`. Al completarlo, crea los fondos del preset elegido, configura el framework de salud, y marca al usuario como onboardeado. Usa los mismos componentes del feature de import para el camino Excel.

---

## Backend

### 1. Renombrar preset/framework `sobres` → `profit_first`

- `FundPresetType.ENVELOPES = 'sobres'` → `FundPresetType.PROFIT_FIRST = 'profit_first'`
- Enum `HealthProfile.framework`: agregar `profit_first`, remover `sobres` — requiere migración de DB
- Actualizar todos los archivos que referencian `sobres`: `fund-presets.ts`, `framework-funds.ts`, `health.service.ts`, DTOs, tipos compartidos en `packages/shared`

### 2. Fondos del preset Profit First

Reemplaza el contenido actual de `ENVELOPES` en `fund-presets.ts`:

| Nombre | Clasificación | isOperative | countsForRunway | frameworkSlot | targetPercentage |
|---|---|---|---|---|---|
| Estilo de Vida | available | ✓ | — | `profit_first:estilo_de_vida` | 55 |
| Diversión / Experiencias | available | — | — | `profit_first:diversion` | 10 |
| Inversión / Ahorro | reserve | — | ✓ | `profit_first:inversion` | 25 |
| Seguridad / Impuestos | reserve | — | ✓ | `profit_first:seguridad` | 10 |

### 3. Framework templates para Profit First

Agregar entrada en `FRAMEWORK_FUND_TEMPLATES` (en `health/framework-funds.ts`) con los mismos 4 slots + targets, para que al cambiar al framework desde `/salud` se siembren automáticamente.

---

## Frontend — Routing y Guard

### ProtectedRoute extendido

```
no autenticado                              → /login
autenticado + onboardingCompleted = false   → /onboarding
autenticado + onboardingCompleted = true    → <Outlet /> (app normal)
```

### Router

```
/login          → AuthPage (login)       — sin guard
/register       → AuthPage (register)    — sin guard
/onboarding     → OnboardingPage         — guard mínimo: no autenticado → /login
<ProtectedRoute>
  <AppLayout>
    / /fondos /transacciones ...          — solo usuarios con onboarding completo
```

`/onboarding` es full-screen, sin `AppLayout`. Requiere autenticación pero no `onboardingCompleted`.

---

## Frontend — Feature `features/onboarding/`

### Estructura

```
features/onboarding/
  OnboardingPage.tsx         ← página raíz, maneja step + selectedPreset
  steps/
    Step1Preset.tsx          ← 4 cards de selección (grid 2×2)
    Step2Funds.tsx           ← lista fondos preset | crear fondos | embed import
    Step3Success.tsx         ← pantalla de éxito + CTA al dashboard
  components/
    FundRow.tsx              ← fila de fondo con nombre + badge clasificación
    AddFundForm.tsx          ← inline form nombre+clasificación (solo path fondos)
  hooks/
    useCompleteOnboarding.ts ← orquesta las llamadas API al finalizar
  api.ts                     ← wrappers de fetch para este feature
  index.ts
```

### Estado en `OnboardingPage`

```ts
step: 1 | 2 | 3
selectedPreset: 'jars_eker' | '50_30_20' | 'profit_first' | 'fondos' | 'excel' | null
customFunds: CreateFundDto[]  // solo path fondos propios
```

### Paso 1 — Selección de sistema

Grid 2×2 con 4 cards:

| Opción | Label visible | Framework | Fondos |
|---|---|---|---|
| `jars_eker` | Jars of Eker | `jars_eker` | 6 fondos preset (solo lectura) |
| `50_30_20` | Regla 50/30/20 | `50_30_20` | 3 fondos preset (solo lectura) |
| `profit_first` | Profit First | `profit_first` | 4 fondos preset (solo lectura) |
| `fondos` | Fondos propios | `fondos` | lista vacía + crear fondos |
| `excel` | Importar Excel | `fondos` | embed UploadStep + PreviewStep |

Cada card muestra: ícono, nombre, descripción corta, badge de metadata (ej. "6 fondos", "3 sobres", "Personalizable").

Botón "Siguiente" habilitado solo cuando hay un preset seleccionado.

### Paso 2 — Fondos

**Path preset (jars_eker / 50_30_20 / profit_first):**
- Lista de fondos del preset en `FundRow` (solo lectura, sin agregar ni editar)
- Subtítulo: "Estos son los fondos que crearemos. Cada uno con su clasificación."
- No se permite agregar fondos custom

**Path fondos propios:**
- Lista vacía inicialmente, cada fondo agregado aparece como `FundRow`
- Botón "Agregar fondo" abre `AddFundForm` inline (nombre + clasificación)
- Puede avanzar con 0 fondos (los crea después desde `/fondos`)

**Path Excel:**
- Embebe `UploadStep` de `features/import-export/components/`
- Tras upload exitoso, embebe `PreviewStep` con el resultado del preview
- Reutiliza hooks `useImportPreview` y `useImportCommit`
- Al commit exitoso: llama `PUT /health/profile` + `PATCH /users/me` → avanza a Paso 3
- El `SuccessStep` del import no se usa — se reemplaza por el Paso 3 del onboarding

### Paso 3 — Éxito

- Checkmark con gradiente
- "Todo listo, [displayName]."
- Texto con el nombre del preset elegido
- Stats: patrimonio inicial ($0) y moneda (CLP)
- Botón "Ir al dashboard" → `navigate('/')`

---

## Llamadas API por path

| Evento | Secuencia de llamadas |
|---|---|
| Confirmar preset | `POST /funds/preset {preset}` → `PUT /health/profile {framework}` → `PATCH /users/me {onboardingCompleted: true}` |
| Confirmar fondos propios | `PUT /health/profile {framework: 'fondos'}` → `PATCH /users/me {onboardingCompleted: true}` (fondos creados uno a uno en Paso 2 vía `POST /funds`) |
| Confirmar Excel | `PUT /health/profile {framework: 'fondos'}` → `PATCH /users/me {onboardingCompleted: true}` |

Las llamadas del path preset son secuenciales. Si `POST /funds/preset` falla, se muestra error inline en Paso 2 y no se avanza.

---

## Verificación de empty states

Antes de cerrar la tarea, confirmar que estas pantallas manejan correctamente el caso "sin fondos creados":

- `/fondos` — lista vacía
- `/transacciones` — sin actividad
- `/transferencias` — sin fondos disponibles para el selector
- `/salud` — sin assessment posible (sin framework o sin fondos)
- `/dashboard` — confirmado previamente

---

## Lo que NO hace este onboarding

- No pide `monthlyIncome` — se configura después en `/salud`
- No permite fondos custom en los paths de preset (jars_eker, 50_30_20, profit_first)
- No muestra el app shell (sidebar/topbar) — es full-screen durante todo el wizard
