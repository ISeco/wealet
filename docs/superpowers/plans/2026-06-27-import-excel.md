# Import Excel Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/import` screen — a 3-step wizard (upload → preview → success) that calls the existing `POST /import/preview` and `POST /import/commit` API endpoints, giving the user control over which unknown funds to create.

**Architecture:** `ImportPage.tsx` owns all shared wizard state (`step`, `file`, `previewData`, `approvedFunds`, `commitResult`). Each step is an independent component receiving props and firing callbacks. Follows the section-extraction pattern from `conventions.md`.

**Tech Stack:** React 18, TypeScript, TanStack Query (`useMutation`), inline styles with CSS custom properties (`var(--card)`, `var(--border)`, etc.), `apiFetch` from `lib/api/client`, raw `fetch` for multipart upload.

## Global Constraints

- All user-facing text in **español neutro** — tuteo, no voseo, no regionalismos.
- Money amounts come from the API as `string` (bigint serialized); format with `formatMoney(amount, 'CLP')` from `lib/money.ts`.
- 2-space indentation, named exports only.
- No new dependencies — use what's already in the project.
- No `balance` column on funds, no Redux, no extra abstractions.
- Design reference: `docs/design/screens/import.html`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/web/src/features/import-export/types.ts` | Create | Types mirroring backend DTOs |
| `apps/web/src/features/import-export/api.ts` | Create | `importPreview()`, `importCommit()` |
| `apps/web/src/features/import-export/hooks.ts` | Create | `useImportPreview()`, `useImportCommit()` |
| `apps/web/src/features/import-export/index.ts` | Create | Public barrel export |
| `apps/web/src/features/import-export/components/StepIndicator.tsx` | Create | Wizard step numbers, no logic |
| `apps/web/src/features/import-export/components/UploadStep.tsx` | Create | Drag & drop + file picker |
| `apps/web/src/features/import-export/components/UnknownFundsSection.tsx` | Create | Collapsible checkboxes for unknown funds |
| `apps/web/src/features/import-export/components/PreviewStep.tsx` | Create | Stats + table + banner + confirm button |
| `apps/web/src/features/import-export/components/SuccessStep.tsx` | Create | Success screen |
| `apps/web/src/features/import-export/ImportPage.tsx` | Create | Wizard orchestration and shared state |
| `apps/web/src/app/router.tsx` | Modify | Add `/import` route |
| `apps/web/src/app/navConfig.ts` | Modify | Enable nav item + add page title |

---

## Task 1: Types, API layer, and hooks

**Files:**
- Create: `apps/web/src/features/import-export/types.ts`
- Create: `apps/web/src/features/import-export/api.ts`
- Create: `apps/web/src/features/import-export/hooks.ts`
- Create: `apps/web/src/features/import-export/index.ts`

**Interfaces:**
- Produces: `ImportRowDto`, `ImportPreviewResponseDto`, `ImportCommitResultDto`, `ParseErrorDto`, `useImportPreview()`, `useImportCommit()` — used by Tasks 3–7.

- [ ] **Step 1: Create `types.ts`**

```typescript
// apps/web/src/features/import-export/types.ts

export type TransactionType = 'income' | 'expense'

export interface ImportRowDto {
  sheet: string
  cell: string
  fundName: string
  amount: string
  type: TransactionType
  description: string | null
  occurredOn: string
  dedupeHash: string
  duplicate?: boolean
}

export interface OpeningBalanceDto {
  sheet: string
  fundName: string
  amount: string
}

export interface ParseErrorDto {
  sheet: string
  cell: string
  message: string
}

export interface ImportPreviewResponseDto {
  rows: ImportRowDto[]
  openingBalances: OpeningBalanceDto[]
  unknownFunds: string[]
  errors: ParseErrorDto[]
}

export interface ImportCommitResultDto {
  imported: number
  skippedDuplicates: number
  createdFunds: string[]
}
```

- [ ] **Step 2: Create `api.ts`**

`importPreview` must use raw `fetch` (not `apiFetch`) because multipart uploads must not set `Content-Type: application/json`. `importCommit` is a standard JSON POST — use `apiFetch`.

```typescript
// apps/web/src/features/import-export/api.ts
import { ApiError, apiFetch } from '../../lib/api/client'
import { API_BASE_URL } from '../../lib/api/config'
import { getAccessToken } from '../../lib/api/tokenStore'
import type { ImportCommitResultDto, ImportPreviewResponseDto, ImportRowDto } from './types'

export async function importPreview(file: File): Promise<ImportPreviewResponseDto> {
  const formData = new FormData()
  formData.append('file', file)
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/import/preview`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      errorBody?.message ?? response.statusText,
      errorBody?.error ?? 'Error',
    )
  }
  return response.json() as Promise<ImportPreviewResponseDto>
}

export function importCommit(rows: ImportRowDto[]): Promise<ImportCommitResultDto> {
  return apiFetch<ImportCommitResultDto>('/import/commit', {
    method: 'POST',
    body: { rows },
  })
}
```

- [ ] **Step 3: Create `hooks.ts`**

```typescript
// apps/web/src/features/import-export/hooks.ts
import { useMutation } from '@tanstack/react-query'
import { importCommit, importPreview } from './api'

export function useImportPreview() {
  return useMutation({
    mutationFn: (file: File) => importPreview(file),
  })
}

export function useImportCommit() {
  return useMutation({
    mutationFn: importCommit,
  })
}
```

- [ ] **Step 4: Create `index.ts`**

```typescript
// apps/web/src/features/import-export/index.ts
export { ImportPage } from './ImportPage'
```

- [ ] **Step 5: Type-check**

```bash
pnpm type-check
```

Expected: no errors in the new files (ImportPage doesn't exist yet — the barrel export will error until Task 7; temporarily remove that export if type-check blocks you, then restore it after Task 7).

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/import-export/types.ts \
        apps/web/src/features/import-export/api.ts \
        apps/web/src/features/import-export/hooks.ts \
        apps/web/src/features/import-export/index.ts
git commit -m "feat(import): add types, api layer and hooks"
```

---

## Task 2: StepIndicator component

**Files:**
- Create: `apps/web/src/features/import-export/components/StepIndicator.tsx`

**Interfaces:**
- Consumes: nothing from previous tasks
- Produces: `<StepIndicator currentStep={1|2|3} />` — used by Task 7 (`ImportPage`)

- [ ] **Step 1: Create `StepIndicator.tsx`**

```typescript
// apps/web/src/features/import-export/components/StepIndicator.tsx

const STEPS = [
  { n: 1, label: 'Subir archivo' },
  { n: 2, label: 'Revisar' },
  { n: 3, label: 'Listo' },
]

interface Props {
  currentStep: 1 | 2 | 3
}

export function StepIndicator({ currentStep }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
      {STEPS.map((step) => {
        const done = currentStep > step.n
        const active = currentStep === step.n
        const circBg = done || active ? 'var(--grad)' : 'var(--card-2)'
        const circColor = done || active ? '#fff' : 'var(--muted)'
        const lblColor = active ? 'var(--text)' : 'var(--muted)'
        return (
          <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                background: circBg,
                color: circColor,
                flex: 'none',
              }}
            >
              {done ? '✓' : step.n}
            </span>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: lblColor,
                marginRight: step.n < STEPS.length ? 22 : 0,
              }}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/import-export/components/StepIndicator.tsx
git commit -m "feat(import): add StepIndicator component"
```

---

## Task 3: UploadStep component

**Files:**
- Create: `apps/web/src/features/import-export/components/UploadStep.tsx`

**Interfaces:**
- Consumes: nothing from previous tasks (self-contained)
- Produces: `<UploadStep onFileReady={fn} isPending={bool} error={string|null} />` — used by Task 7

- [ ] **Step 1: Create `UploadStep.tsx`**

```typescript
// apps/web/src/features/import-export/components/UploadStep.tsx
import { useRef, useState } from 'react'

interface Props {
  onFileReady: (file: File) => void
  isPending: boolean
  error: string | null
}

const ACCEPTED = ['.xlsx', '.csv']

function validateFile(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!ACCEPTED.some((ext) => name.endsWith(ext))) {
    return 'Formato no válido. Usa un archivo .xlsx o .csv.'
  }
  return null
}

export function UploadStep({ onFileReady, isPending, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function handleFile(file: File) {
    const err = validateFile(file)
    if (err) {
      setLocalError(err)
      setSelectedFile(null)
      return
    }
    setLocalError(null)
    setSelectedFile(file)
    onFileReady(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const displayError = localError ?? error

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          background: 'var(--card)',
          border: `2px dashed ${dragOver ? 'var(--info)' : 'var(--border-strong)'}`,
          borderRadius: 16,
          padding: '56px 24px',
          textAlign: 'center',
          opacity: isPending ? 0.6 : 1,
          pointerEvents: isPending ? 'none' : 'auto',
          transition: 'border-color 0.15s',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'var(--tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v11M12 3l-4 4M12 3l4 4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {isPending ? 'Analizando archivo…' : 'Arrastra tu cartola o Excel aquí'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
          Formatos .xlsx, .csv · columnas fecha, descripción, monto, fondo
        </div>

        {displayError && (
          <div style={{ fontSize: 13, color: 'var(--neg)', marginTop: 10, fontWeight: 500 }}>
            {displayError}
          </div>
        )}

        {!isPending && (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                marginTop: 20,
                height: 40,
                padding: '0 18px',
                border: '1px solid var(--border)',
                borderRadius: 9,
                background: 'var(--card)',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Seleccionar archivo
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv"
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />
          </>
        )}
      </div>

      {selectedFile && !isPending && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: 'var(--shadow)',
            padding: '14px 18px',
            marginTop: 16,
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: 'var(--pos-bg)',
              color: 'var(--pos)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3v5h5" />
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{selectedFile.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {(selectedFile.size / 1024).toFixed(0)} KB
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/import-export/components/UploadStep.tsx
git commit -m "feat(import): add UploadStep component"
```

---

## Task 4: UnknownFundsSection component

**Files:**
- Create: `apps/web/src/features/import-export/components/UnknownFundsSection.tsx`

**Interfaces:**
- Consumes: nothing from previous tasks
- Produces: `<UnknownFundsSection unknownFunds={string[]} approvedFunds={Set<string>} onToggle={(name:string)=>void} />` — used by Task 5

- [ ] **Step 1: Create `UnknownFundsSection.tsx`**

```typescript
// apps/web/src/features/import-export/components/UnknownFundsSection.tsx
import { useState } from 'react'

interface Props {
  unknownFunds: string[]
  approvedFunds: Set<string>
  onToggle: (name: string) => void
}

const VISIBLE_LIMIT = 3

export function UnknownFundsSection({ unknownFunds, approvedFunds, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? unknownFunds : unknownFunds.slice(0, VISIBLE_LIMIT)
  const hiddenCount = unknownFunds.length - VISIBLE_LIMIT

  return (
    <div
      style={{
        background: 'var(--warn-bg)',
        border: '1px solid var(--warn)',
        borderRadius: 12,
        padding: '14px 18px',
        marginTop: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          Fondos nuevos detectados
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
        Estas filas crearán fondos que aún no existen en tu cuenta. Desmarca los que no quieras crear — esas filas no se importarán.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
        {visible.map((name) => (
          <label
            key={name}
            style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}
          >
            <input
              type="checkbox"
              checked={approvedFunds.has(name)}
              onChange={() => onToggle(name)}
              style={{ accentColor: 'var(--warn)', width: 15, height: 15 }}
            />
            {name}
          </label>
        ))}
      </div>
      {unknownFunds.length > VISIBLE_LIMIT && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            marginTop: 10,
            background: 'none',
            border: 'none',
            color: 'var(--warn)',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
          }}
        >
          {expanded ? 'Ver menos ↑' : `Ver ${hiddenCount} más ↓`}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/import-export/components/UnknownFundsSection.tsx
git commit -m "feat(import): add UnknownFundsSection component"
```

---

## Task 5: PreviewStep component

**Files:**
- Create: `apps/web/src/features/import-export/components/PreviewStep.tsx`

**Interfaces:**
- Consumes: `ImportPreviewResponseDto`, `ImportRowDto`, `ParseErrorDto` from `../types`; `UnknownFundsSection` from Task 4; `formatMoney` from `lib/money`
- Produces: `<PreviewStep previewData={...} approvedFunds={Set<string>} onToggleFund={fn} onBack={fn} onConfirm={fn} isPending={bool} />` — used by Task 7

- [ ] **Step 1: Create `PreviewStep.tsx`**

```typescript
// apps/web/src/features/import-export/components/PreviewStep.tsx
import { formatMoney } from '../../../lib/money'
import type { ImportPreviewResponseDto, ImportRowDto } from '../types'
import { UnknownFundsSection } from './UnknownFundsSection'

interface Props {
  previewData: ImportPreviewResponseDto
  approvedFunds: Set<string>
  onToggleFund: (name: string) => void
  onBack: () => void
  onConfirm: () => void
  isPending: boolean
}

function rowBadge(
  row: ImportRowDto,
  unknownFunds: string[],
  approvedFunds: Set<string>,
): { label: string; bg: string; color: string } {
  if (row.duplicate) return { label: 'Duplicada', bg: 'var(--warn-bg)', color: 'var(--warn)' }
  if (unknownFunds.includes(row.fundName) && !approvedFunds.has(row.fundName)) {
    return { label: 'Se omitirá', bg: 'var(--card-2)', color: 'var(--muted)' }
  }
  return { label: 'Válida', bg: 'var(--pos-bg)', color: 'var(--pos)' }
}

function rowOpacity(row: ImportRowDto, unknownFunds: string[], approvedFunds: Set<string>): number {
  if (row.duplicate) return 0.6
  if (unknownFunds.includes(row.fundName) && !approvedFunds.has(row.fundName)) return 0.5
  return 1
}

export function PreviewStep({ previewData, approvedFunds, onToggleFund, onBack, onConfirm, isPending }: Props) {
  const { rows, unknownFunds, errors } = previewData

  const validCount = rows.filter((r) => !r.duplicate).length
  const duplicateCount = rows.filter((r) => r.duplicate).length
  const errorCount = errors.length

  const willImportCount = rows.filter(
    (r) => !r.duplicate && (!unknownFunds.includes(r.fundName) || approvedFunds.has(r.fundName)),
  ).length

  const skippedByFund = rows.filter(
    (r) => !r.duplicate && unknownFunds.includes(r.fundName) && !approvedFunds.has(r.fundName),
  ).length

  const statCards = [
    { label: 'Válidas', value: validCount, dotColor: 'var(--pos)' },
    { label: 'Duplicadas', value: duplicateCount, dotColor: 'var(--warn)' },
    { label: 'Con errores', value: errorCount, dotColor: 'var(--neg)' },
  ]

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow)',
              padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: card.dotColor, flex: 'none' }} />
              {card.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 140px 150px 110px',
            gap: 12,
            padding: '11px 20px',
            borderBottom: '1px solid var(--border)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            color: 'var(--muted)',
          }}
        >
          <div>Fecha</div>
          <div>Descripción</div>
          <div style={{ textAlign: 'right' }}>Monto</div>
          <div>Fondo</div>
          <div>Estado</div>
        </div>
        {rows.map((row) => {
          const badge = rowBadge(row, unknownFunds, approvedFunds)
          const opacity = rowOpacity(row, unknownFunds, approvedFunds)
          const amtColor = row.type === 'income' ? 'var(--pos)' : 'var(--neg)'
          const prefix = row.type === 'income' ? '+' : '-'
          return (
            <div
              key={row.dedupeHash}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr 140px 150px 110px',
                gap: 12,
                alignItems: 'center',
                padding: '11px 20px',
                borderBottom: '1px solid var(--border)',
                background: row.duplicate ? 'var(--warn-bg)' : 'transparent',
                opacity,
              }}
            >
              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                {row.occurredOn}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.description ?? '—'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: amtColor }}>
                {prefix}{formatMoney(row.amount, 'CLP')}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.fundName}
              </div>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: 20,
                    background: badge.bg,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Unknown funds section */}
      {unknownFunds.length > 0 && (
        <UnknownFundsSection
          unknownFunds={unknownFunds}
          approvedFunds={approvedFunds}
          onToggle={onToggleFund}
        />
      )}

      {/* Warning banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 9,
          padding: '12px 14px',
          background: 'var(--warn-bg)',
          borderRadius: 10,
          marginTop: 16,
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.55 }}>
          Se importarán <strong>{willImportCount} transacciones</strong>. {duplicateCount} duplicadas se omiten.
          {skippedByFund > 0 && ` ${skippedByFund} filas se omitirán por fondos no aprobados.`}
          {errorCount > 0 && ` ${errorCount} filas no pudieron parsearse y se excluyen.`}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button
          onClick={onBack}
          disabled={isPending}
          style={{
            height: 44,
            padding: '0 18px',
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--card)',
            color: 'var(--text)',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 500,
            cursor: isPending ? 'default' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          ← Volver
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending || willImportCount === 0}
          style={{
            height: 44,
            padding: '0 22px',
            border: 'none',
            borderRadius: 10,
            background: isPending || willImportCount === 0 ? 'var(--card-2)' : 'var(--grad)',
            color: isPending || willImportCount === 0 ? 'var(--muted)' : '#fff',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            cursor: isPending || willImportCount === 0 ? 'default' : 'pointer',
            boxShadow: isPending || willImportCount === 0 ? 'none' : 'var(--shadow)',
          }}
        >
          {isPending ? 'Importando…' : `Confirmar e importar ${willImportCount}`}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/import-export/components/PreviewStep.tsx
git commit -m "feat(import): add PreviewStep component"
```

---

## Task 6: SuccessStep component

**Files:**
- Create: `apps/web/src/features/import-export/components/SuccessStep.tsx`

**Interfaces:**
- Consumes: `ImportCommitResultDto` from `../types`
- Produces: `<SuccessStep result={...} displayName={string|null} onImportAnother={fn} onGoToTransactions={fn} />` — used by Task 7

- [ ] **Step 1: Create `SuccessStep.tsx`**

```typescript
// apps/web/src/features/import-export/components/SuccessStep.tsx
import type { ImportCommitResultDto } from '../types'

interface Props {
  result: ImportCommitResultDto
  displayName: string | null
  onImportAnother: () => void
  onGoToTransactions: () => void
}

export function SuccessStep({ result, displayName, onImportAnother, onGoToTransactions }: Props) {
  const greeting = displayName ? `¡Listo, ${displayName}!` : '¡Listo!'
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: 'var(--shadow)',
        padding: '56px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'var(--pos-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--pos)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{greeting}</div>
      <div
        style={{
          fontSize: 14,
          color: 'var(--muted)',
          marginTop: 8,
          maxWidth: 380,
          margin: '8px auto 0',
          lineHeight: 1.55,
        }}
      >
        Se importaron <strong style={{ color: 'var(--text)' }}>{result.imported} transacciones</strong> y se distribuyeron en tus fondos.
        {result.createdFunds.length > 0 && (
          <> Se crearon <strong style={{ color: 'var(--text)' }}>{result.createdFunds.length} fondos nuevos</strong>.</>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
        <button
          onClick={onImportAnother}
          style={{
            height: 42,
            padding: '0 18px',
            border: '1px solid var(--border)',
            borderRadius: 9,
            background: 'var(--card)',
            color: 'var(--text)',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Importar otro
        </button>
        <button
          onClick={onGoToTransactions}
          style={{
            height: 42,
            padding: '0 20px',
            border: 'none',
            borderRadius: 9,
            background: 'var(--grad)',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow)',
          }}
        >
          Ver transacciones
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/import-export/components/SuccessStep.tsx
git commit -m "feat(import): add SuccessStep component"
```

---

## Task 7: ImportPage — wizard orchestration

**Files:**
- Create: `apps/web/src/features/import-export/ImportPage.tsx`

**Interfaces:**
- Consumes: `useImportPreview`, `useImportCommit` from `./hooks`; `StepIndicator`, `UploadStep`, `PreviewStep`, `SuccessStep` from `./components/*`; `ImportPreviewResponseDto`, `ImportCommitResultDto` from `./types`; `useAuth` from `../auth`; `useNavigate` from `react-router-dom`
- Produces: `<ImportPage />` — exported via `index.ts`, consumed by Task 8's router

**Filtering logic for commit:**
Rows sent to commit = `rows` where `!row.duplicate` AND (`!unknownFunds.includes(row.fundName)` OR `approvedFunds.has(row.fundName)`).

- [ ] **Step 1: Create `ImportPage.tsx`**

```typescript
// apps/web/src/features/import-export/ImportPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useImportCommit, useImportPreview } from './hooks'
import type { ImportCommitResultDto, ImportPreviewResponseDto } from './types'
import { StepIndicator } from './components/StepIndicator'
import { UploadStep } from './components/UploadStep'
import { PreviewStep } from './components/PreviewStep'
import { SuccessStep } from './components/SuccessStep'

export function ImportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [previewData, setPreviewData] = useState<ImportPreviewResponseDto | null>(null)
  const [approvedFunds, setApprovedFunds] = useState<Set<string>>(new Set())
  const [commitResult, setCommitResult] = useState<ImportCommitResultDto | null>(null)

  const previewMutation = useImportPreview()
  const commitMutation = useImportCommit()

  function handleFileReady(file: File) {
    previewMutation.mutate(file, {
      onSuccess: (data) => {
        setPreviewData(data)
        setApprovedFunds(new Set(data.unknownFunds))
        setStep(2)
      },
    })
  }

  function handleToggleFund(name: string) {
    setApprovedFunds((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  function handleBack() {
    previewMutation.reset()
    setPreviewData(null)
    setApprovedFunds(new Set())
    setStep(1)
  }

  function handleConfirm() {
    if (!previewData) return
    const rowsToCommit = previewData.rows.filter(
      (row) =>
        !row.duplicate &&
        (!previewData.unknownFunds.includes(row.fundName) || approvedFunds.has(row.fundName)),
    )
    commitMutation.mutate(rowsToCommit, {
      onSuccess: (result) => {
        setCommitResult(result)
        setStep(3)
      },
    })
  }

  function handleReset() {
    previewMutation.reset()
    commitMutation.reset()
    setPreviewData(null)
    setApprovedFunds(new Set())
    setCommitResult(null)
    setStep(1)
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <StepIndicator currentStep={step} />

      {step === 1 && (
        <UploadStep
          onFileReady={handleFileReady}
          isPending={previewMutation.isPending}
          error={previewMutation.error?.message ?? null}
        />
      )}

      {step === 2 && previewData && (
        <PreviewStep
          previewData={previewData}
          approvedFunds={approvedFunds}
          onToggleFund={handleToggleFund}
          onBack={handleBack}
          onConfirm={handleConfirm}
          isPending={commitMutation.isPending}
        />
      )}

      {step === 3 && commitResult && (
        <SuccessStep
          result={commitResult}
          displayName={user?.displayName ?? null}
          onImportAnother={handleReset}
          onGoToTransactions={() => navigate('/transacciones')}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm type-check
```

Expected: no errors. If `index.ts` had a broken export earlier, it's now resolved.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/import-export/ImportPage.tsx
git commit -m "feat(import): add ImportPage wizard orchestration"
```

---

## Task 8: Routing and nav integration

**Files:**
- Modify: `apps/web/src/app/router.tsx`
- Modify: `apps/web/src/app/navConfig.ts`

**Interfaces:**
- Consumes: `ImportPage` from `../features/import-export` (lazy)
- Produces: `/import` route live in app, nav item clickable

- [ ] **Step 1: Add route in `router.tsx`**

Add a lazy import at the top of the file and insert the `/import` route inside the `AppLayout` block.

```typescript
// apps/web/src/app/router.tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage, ProtectedRoute } from '../features/auth'
import { CategoriesPage } from '../features/categories'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { FundsPage, FundDetailPage } from '../features/funds'
import { HealthPage } from '../features/health/HealthPage'
import { SettingsPage } from '../features/settings'
import { TransactionsPage } from '../features/transactions'
import { TransfersPage } from '../features/transfers'
import { AppLayout } from './AppLayout'

const ImportPage = lazy(() =>
  import('../features/import-export').then((m) => ({ default: m.ImportPage })),
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/fondos" element={<FundsPage />} />
            <Route path="/fondos/:id" element={<FundDetailPage />} />
            <Route path="/transacciones" element={<TransactionsPage />} />
            <Route path="/transferencias" element={<TransfersPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/salud" element={<HealthPage />} />
            <Route path="/ajustes" element={<SettingsPage />} />
            <Route
              path="/import"
              element={
                <Suspense fallback={null}>
                  <ImportPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Update `navConfig.ts`**

Remove `disabled: true` and add the page title entry.

```typescript
// apps/web/src/app/navConfig.ts
import type { ComponentType } from 'react'
import {
  CategoriesIcon,
  DashboardIcon,
  FundsIcon,
  HealthIcon,
  ImportIcon,
  SettingsIcon,
  TransfersIcon,
  TransactionsIcon,
} from './icons'

export interface NavItem {
  key: string
  label: string
  path: string
  icon: ComponentType<{ color?: string }>
  /** Page not built yet — shown but not clickable. */
  disabled?: boolean
}

export const navMain: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/', icon: DashboardIcon },
  { key: 'funds', label: 'Fondos', path: '/fondos', icon: FundsIcon },
  { key: 'transactions', label: 'Transacciones', path: '/transacciones', icon: TransactionsIcon },
  { key: 'transfers', label: 'Transferencias', path: '/transferencias', icon: TransfersIcon },
  { key: 'health', label: 'Salud financiera', path: '/salud', icon: HealthIcon },
  { key: 'categories', label: 'Categorías', path: '/categorias', icon: CategoriesIcon },
]

export const navSys: NavItem[] = [
  { key: 'import', label: 'Importar Excel', path: '/import', icon: ImportIcon },
  { key: 'settings', label: 'Ajustes', path: '/ajustes', icon: SettingsIcon },
]

export const pageTitles: Record<string, { crumb: string; title: string }> = {
  '/': { crumb: 'General', title: 'Dashboard' },
  '/fondos': { crumb: 'General', title: 'Fondos' },
  '/transacciones': { crumb: 'General', title: 'Transacciones' },
  '/categorias': { crumb: 'General', title: 'Categorías' },
  '/transferencias': { crumb: 'General', title: 'Transferencias' },
  '/salud': { crumb: 'General', title: 'Salud financiera' },
  '/ajustes': { crumb: 'Sistema', title: 'Ajustes' },
  '/import': { crumb: 'Sistema', title: 'Importar Excel' },
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 4: Run the dev server and verify manually**

```bash
pnpm --filter web dev
```

Open `http://localhost:5173`. Verify:
1. Sidebar shows "Importar Excel" as a clickable link (not greyed out).
2. Navigating to `/import` renders the wizard with the StepIndicator at step 1.
3. Dragging a `.txt` file shows the inline error "Formato no válido".
4. Dropping a valid `.xlsx` file triggers the upload and shows a spinner.
5. After preview loads, step 2 shows stats, table, and (if unknownFunds present) the fund checkboxes.
6. Unmarking a fund turns those rows to "Se omitirá" badge + faded opacity.
7. "Confirmar e importar" fires the commit and advances to step 3.
8. "Importar otro" resets to step 1. "Ver transacciones" navigates to `/transacciones`.

- [ ] **Step 5: Update `docs/modules.md` Estado actual**

Add a bullet to the "Estado actual" section at the top of `docs/modules.md`:

```
- **Import/Export**: pantalla `/import` implementada. Wizard 3 pasos: upload → preview (stats + tabla de filas + sección fondos desconocidos colapsable con checkboxes) → éxito. El usuario controla qué fondos desconocidos aprobar; filas de fondos no aprobados se excluyen del commit. Export .xlsx sigue en Ajustes.
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/router.tsx \
        apps/web/src/app/navConfig.ts \
        docs/modules.md
git commit -m "feat(import): wire up /import route and enable nav item"
```
