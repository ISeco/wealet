# Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 3-step onboarding wizard that runs for every new user on first login, creating preset funds and configuring the health framework before redirecting to the dashboard.

**Architecture:** Backend renames the `sobres` preset to `profit_first`, adds it as a full health framework with slot-based assessment, and writes a DB migration. Frontend extends `ProtectedRoute` to redirect unauthenticated-onboarding users to a new full-screen `/onboarding` route that embeds the existing import components for the Excel path.

**Tech Stack:** NestJS + TypeORM (backend), React + React Query + React Router (frontend), supertest (e2e tests)

## Global Constraints

- All user-facing text in **español neutro** — tuteo, no voseo, no regionalismos
- Money amounts are always `bigint` — never `float`
- `synchronize: false` always — schema changes go through versioned migrations only
- Every query on a user-owned entity must filter by `userId` from `@CurrentUser()`
- Run `pnpm --filter api migration:run` after adding any migration before testing
- Run `pnpm --filter api test:e2e` to run backend e2e tests against `wealet_test` DB
- Run `pnpm type-check` and `pnpm lint` before each commit

---

## File Map

**Backend — modified:**
- `apps/api/src/modules/funds/enums/fund-preset.enum.ts` — rename `ENVELOPES='sobres'` → `PROFIT_FIRST='profit_first'`
- `apps/api/src/modules/funds/presets/fund-presets.ts` — replace sobres funds with Profit First funds
- `apps/api/src/modules/health/entities/health-profile.entity.ts` — add `PROFIT_FIRST='profit_first'` to `HealthFramework` enum
- `apps/api/src/modules/health/framework-funds.ts` — add Profit First templates + update `frameworkSlotPrefix`

**Backend — created:**
- `apps/api/src/database/migrations/1782540000000-AddProfitFirstFramework.ts` — adds `profit_first` to DB enum

**Frontend — modified:**
- `apps/web/src/features/auth/ProtectedRoute.tsx` — add `onboardingCompleted` redirect
- `apps/web/src/app/router.tsx` — add `/onboarding` route

**Frontend — created:**
- `apps/web/src/features/onboarding/OnboardingPage.tsx` — root page, step state machine
- `apps/web/src/features/onboarding/steps/Step1Preset.tsx` — 4 preset cards (grid 2×2)
- `apps/web/src/features/onboarding/steps/Step2Funds.tsx` — fund preview / create / Excel embed
- `apps/web/src/features/onboarding/steps/Step3Success.tsx` — success screen + CTA
- `apps/web/src/features/onboarding/components/FundRow.tsx` — single fund row with classification badge
- `apps/web/src/features/onboarding/components/AddFundForm.tsx` — inline form for fondos path
- `apps/web/src/features/onboarding/hooks/useCompleteOnboarding.ts` — mutation orchestrator
- `apps/web/src/features/onboarding/api.ts` — fetch wrappers
- `apps/web/src/features/onboarding/index.ts` — public exports

---

## Task 1: Backend — rename `sobres` → `profit_first` + DB migration

**Files:**
- Modify: `apps/api/src/modules/funds/enums/fund-preset.enum.ts`
- Modify: `apps/api/src/modules/funds/presets/fund-presets.ts`
- Modify: `apps/api/src/modules/health/entities/health-profile.entity.ts`
- Modify: `apps/api/src/modules/health/framework-funds.ts`
- Create: `apps/api/src/database/migrations/1782540000000-AddProfitFirstFramework.ts`

**Interfaces:**
- Produces: `FundPresetType.PROFIT_FIRST = 'profit_first'`, `HealthFramework.PROFIT_FIRST = 'profit_first'`
- Produces: `FRAMEWORK_FUND_TEMPLATES[HealthFramework.PROFIT_FIRST]` array with 4 templates
- Produces: `frameworkSlotPrefix(HealthFramework.PROFIT_FIRST)` returns `'profit_first:'`

- [ ] **Step 1: Update `fund-preset.enum.ts`**

Replace the file content:

```ts
export enum FundPresetType {
  JARS_EKER = 'jars_eker',
  RULE_50_30_20 = '50_30_20',
  PROFIT_FIRST = 'profit_first',
}
```

- [ ] **Step 2: Update `fund-presets.ts`**

Replace the `ENVELOPES` entry with `PROFIT_FIRST` and new funds:

```ts
import { FundClassification } from '../entities/fund.entity';
import { FundPresetType } from '../enums/fund-preset.enum';

interface FundPresetEntry {
  name: string;
  classification: FundClassification;
  isOperative: boolean;
  countsForRunway: boolean;
  frameworkSlot: string | null;
  targetPercentage: number | null;
}

export const FUND_PRESETS: Record<FundPresetType, FundPresetEntry[]> = {
  [FundPresetType.JARS_EKER]: [
    { name: 'Necesidades', classification: FundClassification.COMMITTED, isOperative: false, countsForRunway: false, frameworkSlot: 'jars_nec', targetPercentage: 55 },
    { name: 'Rico', classification: FundClassification.AVAILABLE, isOperative: true, countsForRunway: false, frameworkSlot: 'jars_ffa', targetPercentage: 10 },
    { name: 'Educación', classification: FundClassification.COMMITTED, isOperative: false, countsForRunway: false, frameworkSlot: 'jars_educ', targetPercentage: 10 },
    { name: 'Inversión', classification: FundClassification.RESERVE, isOperative: false, countsForRunway: true, frameworkSlot: 'jars_ltss', targetPercentage: 10 },
    { name: 'Emergencia', classification: FundClassification.RESERVE, isOperative: false, countsForRunway: true, frameworkSlot: 'jars_play', targetPercentage: 10 },
    { name: 'Dar', classification: FundClassification.AVAILABLE, isOperative: false, countsForRunway: false, frameworkSlot: 'jars_give', targetPercentage: 5 },
  ],
  [FundPresetType.RULE_50_30_20]: [
    { name: 'Necesidades', classification: FundClassification.COMMITTED, isOperative: false, countsForRunway: false, frameworkSlot: '50_30_20_committed', targetPercentage: 50 },
    { name: 'Deseos', classification: FundClassification.AVAILABLE, isOperative: true, countsForRunway: false, frameworkSlot: '50_30_20_available', targetPercentage: 30 },
    { name: 'Ahorro', classification: FundClassification.RESERVE, isOperative: false, countsForRunway: true, frameworkSlot: '50_30_20_reserve', targetPercentage: 20 },
  ],
  [FundPresetType.PROFIT_FIRST]: [
    { name: 'Estilo de Vida', classification: FundClassification.AVAILABLE, isOperative: true, countsForRunway: false, frameworkSlot: 'profit_first:estilo_de_vida', targetPercentage: 55 },
    { name: 'Diversión / Experiencias', classification: FundClassification.AVAILABLE, isOperative: false, countsForRunway: false, frameworkSlot: 'profit_first:diversion', targetPercentage: 10 },
    { name: 'Inversión / Ahorro', classification: FundClassification.RESERVE, isOperative: false, countsForRunway: true, frameworkSlot: 'profit_first:inversion', targetPercentage: 25 },
    { name: 'Seguridad / Impuestos', classification: FundClassification.RESERVE, isOperative: false, countsForRunway: true, frameworkSlot: 'profit_first:seguridad', targetPercentage: 10 },
  ],
};
```

Note: the `FundPresetEntry` interface now includes `frameworkSlot` and `targetPercentage`. The `Fund` entity already has these columns so no DB changes are needed here. The `createPreset` service method in `funds.service.ts` uses spread (`{ ...entry, userId }`) — verify it passes the new fields through to the Fund entity; they are already optional columns so no changes needed to the service.

- [ ] **Step 3: Add `PROFIT_FIRST` to `HealthFramework` enum in `health-profile.entity.ts`**

```ts
export enum HealthFramework {
  FIFTY_THIRTY_TWENTY = '50_30_20',
  JARS_EKER = 'jars_eker',
  FONDOS = 'fondos',
  PROFIT_FIRST = 'profit_first',
}
```

- [ ] **Step 4: Update `framework-funds.ts`**

Add the Profit First templates and update `frameworkSlotPrefix`:

```ts
import { FundClassification } from '../funds/entities/fund.entity';
import { HealthFramework } from './entities/health-profile.entity';

export interface FundTemplate {
  slot: string;
  name: string;
  classification: FundClassification;
  targetPercentage: number;
}

export const FRAMEWORK_FUND_TEMPLATES: Record<HealthFramework, FundTemplate[]> = {
  [HealthFramework.FIFTY_THIRTY_TWENTY]: [
    { slot: '50_30_20_committed', name: 'Necesidades', classification: FundClassification.COMMITTED, targetPercentage: 50 },
    { slot: '50_30_20_available', name: 'Deseos', classification: FundClassification.AVAILABLE, targetPercentage: 30 },
    { slot: '50_30_20_reserve', name: 'Ahorro', classification: FundClassification.RESERVE, targetPercentage: 20 },
  ],
  [HealthFramework.JARS_EKER]: [
    { slot: 'jars_nec', name: 'Necesidades', classification: FundClassification.COMMITTED, targetPercentage: 55 },
    { slot: 'jars_ffa', name: 'Libertad Financiera', classification: FundClassification.RESERVE, targetPercentage: 10 },
    { slot: 'jars_educ', name: 'Educación', classification: FundClassification.COMMITTED, targetPercentage: 10 },
    { slot: 'jars_ltss', name: 'Largo Plazo', classification: FundClassification.RESERVE, targetPercentage: 10 },
    { slot: 'jars_play', name: 'Juego', classification: FundClassification.AVAILABLE, targetPercentage: 10 },
    { slot: 'jars_give', name: 'Donaciones', classification: FundClassification.AVAILABLE, targetPercentage: 5 },
  ],
  [HealthFramework.PROFIT_FIRST]: [
    { slot: 'profit_first:estilo_de_vida', name: 'Estilo de Vida', classification: FundClassification.AVAILABLE, targetPercentage: 55 },
    { slot: 'profit_first:diversion', name: 'Diversión / Experiencias', classification: FundClassification.AVAILABLE, targetPercentage: 10 },
    { slot: 'profit_first:inversion', name: 'Inversión / Ahorro', classification: FundClassification.RESERVE, targetPercentage: 25 },
    { slot: 'profit_first:seguridad', name: 'Seguridad / Impuestos', classification: FundClassification.RESERVE, targetPercentage: 10 },
  ],
  [HealthFramework.FONDOS]: [],
};

export function frameworkSlotPrefix(framework: HealthFramework): string {
  if (framework === HealthFramework.FIFTY_THIRTY_TWENTY) return '50_30_20_';
  if (framework === HealthFramework.JARS_EKER) return 'jars_';
  if (framework === HealthFramework.PROFIT_FIRST) return 'profit_first:';
  return '';
}
```

- [ ] **Step 5: Write DB migration**

Create `apps/api/src/database/migrations/1782540000000-AddProfitFirstFramework.ts`:

```ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfitFirstFramework1782540000000 implements MigrationInterface {
  name = 'AddProfitFirstFramework1782540000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."health_profiles_framework_enum" ADD VALUE IF NOT EXISTS 'profit_first'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support DROP VALUE from an enum.
    // To roll back: recreate the enum without 'profit_first' and migrate data manually.
  }
}
```

- [ ] **Step 6: Run type-check**

```
pnpm type-check
```

Expected: 0 errors. If `FundPresetEntry` interface change causes a type error in `funds.service.ts` `createPreset` method (spread includes new optional fields), verify that `Fund` entity already accepts `frameworkSlot` and `targetPercentage` — it does.

- [ ] **Step 7: Run migrations against test DB**

```
pnpm --filter api migration:run
```

Expected: migration `AddProfitFirstFramework1782540000000` runs successfully.

- [ ] **Step 8: Write e2e test for profit_first preset**

Add to `apps/api/test/app.e2e-spec.ts` or create `apps/api/test/funds-preset.e2e-spec.ts`:

```ts
import request from 'supertest';
import { createTestApp, registerTestUser, deleteTestUsers, GLOBAL_PREFIX } from './utils/test-app';
import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import type { App } from 'supertest/types';

describe('POST /funds/preset — profit_first', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    ({ accessToken, userId } = await registerTestUser(app, 'preset-pf'));
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userId]);
    await app.close();
  });

  it('creates 4 profit_first funds with correct slots', async () => {
    const res = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds/preset`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ preset: 'profit_first' })
      .expect(201);

    const funds = res.body as Array<{ name: string; frameworkSlot: string; targetPercentage: number }>;
    expect(funds).toHaveLength(4);
    expect(funds.map((f) => f.frameworkSlot)).toEqual(
      expect.arrayContaining([
        'profit_first:estilo_de_vida',
        'profit_first:diversion',
        'profit_first:inversion',
        'profit_first:seguridad',
      ]),
    );
  });

  it('rejects unknown preset value', async () => {
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds/preset`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ preset: 'sobres' })
      .expect(400);
  });
});
```

- [ ] **Step 9: Run e2e tests**

```
pnpm --filter api test:e2e
```

Expected: new test passes, existing tests unaffected.

- [ ] **Step 10: Commit**

```
git add apps/api/src/modules/funds/enums/fund-preset.enum.ts
git add apps/api/src/modules/funds/presets/fund-presets.ts
git add apps/api/src/modules/health/entities/health-profile.entity.ts
git add apps/api/src/modules/health/framework-funds.ts
git add apps/api/src/database/migrations/1782540000000-AddProfitFirstFramework.ts
git add apps/api/test/funds-preset.e2e-spec.ts
git commit -m "feat(health): add profit_first framework, rename sobres preset"
```

---

## Task 2: Frontend routing — ProtectedRoute guard + `/onboarding` route skeleton

**Files:**
- Modify: `apps/web/src/features/auth/ProtectedRoute.tsx`
- Modify: `apps/web/src/app/router.tsx`
- Create: `apps/web/src/features/onboarding/OnboardingPage.tsx` (skeleton)
- Create: `apps/web/src/features/onboarding/index.ts`

**Interfaces:**
- Consumes: `user.onboardingCompleted: boolean` from `useAuth()`
- Produces: `/onboarding` route renders `OnboardingPage`; authenticated users with `onboardingCompleted=false` are redirected there from any protected route

- [ ] **Step 1: Extend `ProtectedRoute.tsx`**

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { status, user } = useAuth()

  if (status === 'idle' || status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
        Cargando…
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  if (user && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
```

- [ ] **Step 2: Create `OnboardingPage.tsx` skeleton**

Create `apps/web/src/features/onboarding/OnboardingPage.tsx`:

```tsx
export function OnboardingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--muted)' }}>Onboarding…</span>
    </div>
  )
}
```

- [ ] **Step 3: Create `index.ts`**

Create `apps/web/src/features/onboarding/index.ts`:

```ts
export { OnboardingPage } from './OnboardingPage'
```

- [ ] **Step 4: Add `/onboarding` route to `router.tsx`**

```tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage, ProtectedRoute } from '../features/auth'
import { OnboardingPage } from '../features/onboarding'
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
        <Route path="/onboarding" element={<OnboardingPage />} />
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

Note: `/onboarding` is outside `<ProtectedRoute>` so it doesn't loop. It also doesn't need a `useAuth` guard for now — unauthenticated users who land on `/onboarding` will just see the skeleton and their mutations will fail with 401.

- [ ] **Step 5: Manual test**

Start `pnpm --filter web dev`. Register a new account. Verify: after register, the app redirects to `/onboarding` (shows the skeleton). Navigate directly to `/` — still redirects to `/onboarding`.

- [ ] **Step 6: Commit**

```
git add apps/web/src/features/auth/ProtectedRoute.tsx
git add apps/web/src/app/router.tsx
git add apps/web/src/features/onboarding/OnboardingPage.tsx
git add apps/web/src/features/onboarding/index.ts
git commit -m "feat(onboarding): add route and ProtectedRoute guard"
```

---

## Task 3: `Step1Preset` — preset selection cards

**Files:**
- Create: `apps/web/src/features/onboarding/steps/Step1Preset.tsx`

**Interfaces:**
- Consumes: `onSelect: (preset: PresetOption) => void`, `selected: PresetOption | null`
- Produces: `PresetOption` type exported from this file

- [ ] **Step 1: Create `Step1Preset.tsx`**

```tsx
export type PresetOption = 'jars_eker' | '50_30_20' | 'profit_first' | 'fondos' | 'excel'

interface PresetCard {
  id: PresetOption
  name: string
  description: string
  meta: string
  iconColor: string
  iconBg: string
  icon: React.ReactNode
}

const CARDS: PresetCard[] = [
  {
    id: 'jars_eker',
    name: 'Jars of Eker',
    description: 'Basado en el libro de T. Harv Eker. Divide tus ingresos en 6 fondos con propósitos específicos.',
    meta: '6 fondos · Slots predefinidos',
    iconColor: 'var(--disp)',
    iconBg: 'var(--disp-bg)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
      </svg>
    ),
  },
  {
    id: '50_30_20',
    name: 'Regla 50/30/20',
    description: 'Distribución clásica: 50% necesidades, 30% deseos, 20% ahorro.',
    meta: '3 fondos · Slots predefinidos',
    iconColor: 'var(--res)',
    iconBg: 'var(--res-bg)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
  {
    id: 'profit_first',
    name: 'Profit First',
    description: 'Inspirado en el libro de Mike Michalowicz. Distribuye por propósito antes de cubrir gastos.',
    meta: '4 fondos · Slots predefinidos',
    iconColor: 'var(--comp)',
    iconBg: 'var(--comp-bg)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'fondos',
    name: 'Fondos propios',
    description: 'Crea y nombra tus fondos a medida. Sin estructura predefinida, total flexibilidad.',
    meta: 'Personalizable',
    iconColor: 'var(--pos)',
    iconBg: 'var(--pos-bg)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
]

interface Props {
  selected: PresetOption | null
  onSelect: (preset: PresetOption) => void
}

export function Step1Preset({ selected, onSelect }: Props) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Paso 1 · Tu sistema
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginTop: 10 }}>
          ¿Cómo quieres ordenar tu dinero?
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8, maxWidth: 480, margin: '8px auto 0' }}>
          Elige un punto de partida. Podrás ajustar y renombrar tus fondos cuando quieras.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {CARDS.map((card) => {
          const isSelected = selected === card.id
          return (
            <div
              key={card.id}
              onClick={() => onSelect(card.id)}
              style={{
                position: 'relative',
                textAlign: 'left',
                padding: 22,
                borderRadius: 14,
                cursor: 'pointer',
                border: `1px solid ${isSelected ? 'var(--disp)' : 'var(--border)'}`,
                background: isSelected ? 'var(--tint)' : 'var(--card)',
                boxShadow: isSelected ? '0 0 0 3px rgba(22,168,154,.15)' : 'none',
                transition: 'all .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ width: 44, height: 44, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: card.iconBg, color: card.iconColor }}>
                  {card.icon}
                </span>
                <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--disp)', opacity: isSelected ? 1 : 0, transition: 'opacity .15s' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
              </div>
              <div style={{ fontSize: 16.5, fontWeight: 600, color: 'var(--text)' }}>{card.name}</div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 6 }}>{card.description}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 14, fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 9px' }}>{card.meta}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```
git add apps/web/src/features/onboarding/steps/Step1Preset.tsx
git commit -m "feat(onboarding): add Step1Preset card selection"
```

---

## Task 4: `api.ts`, `useCompleteOnboarding`, `FundRow`, `AddFundForm`, `Step2Funds` (preset + fondos paths)

**Files:**
- Create: `apps/web/src/features/onboarding/api.ts`
- Create: `apps/web/src/features/onboarding/hooks/useCompleteOnboarding.ts`
- Create: `apps/web/src/features/onboarding/components/FundRow.tsx`
- Create: `apps/web/src/features/onboarding/components/AddFundForm.tsx`
- Create: `apps/web/src/features/onboarding/steps/Step2Funds.tsx`

**Interfaces:**
- Consumes: `PresetOption` from `Step1Preset.tsx`
- Consumes: `CreateFundPayload`, `FundClassification` from `features/funds/types.ts`
- Produces: `useCompleteOnboarding()` returns `{ mutate, isPending, error }`
- Produces: `Step2Funds` props: `{ preset, customFunds, onAddFund, onRemoveFund, onConfirm, isPending, error }`

- [ ] **Step 1: Create `api.ts`**

```ts
import { apiFetch } from '../../lib/api/client'
import type { CreateFundPayload } from '../funds/types'

type Framework = 'jars_eker' | '50_30_20' | 'profit_first' | 'fondos'

export function createPresetFunds(preset: 'jars_eker' | '50_30_20' | 'profit_first') {
  return apiFetch<void>('/funds/preset', { method: 'POST', body: { preset } })
}

export function setHealthFramework(framework: Framework) {
  return apiFetch<void>('/health/profile', { method: 'PUT', body: { framework } })
}

export function completeOnboarding() {
  return apiFetch<void>('/users/me', { method: 'PATCH', body: { onboardingCompleted: true } })
}

export function createFund(payload: CreateFundPayload) {
  return apiFetch<{ id: string }>('/funds', { method: 'POST', body: payload })
}
```

- [ ] **Step 2: Create `useCompleteOnboarding.ts`**

```ts
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { completeOnboarding, createPresetFunds, setHealthFramework } from '../api'
import type { PresetOption } from '../steps/Step1Preset'
import type { CreateFundPayload } from '../../funds/types'

const PRESET_TO_FRAMEWORK: Record<Exclude<PresetOption, 'fondos' | 'excel'>, 'jars_eker' | '50_30_20' | 'profit_first'> = {
  jars_eker: 'jars_eker',
  '50_30_20': '50_30_20',
  profit_first: 'profit_first',
}

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  const { refetchUser } = useAuth()
  const navigate = useNavigate()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function complete(preset: PresetOption) {
    setIsPending(true)
    setError(null)
    try {
      if (preset === 'jars_eker' || preset === '50_30_20' || preset === 'profit_first') {
        await createPresetFunds(preset)
        await setHealthFramework(PRESET_TO_FRAMEWORK[preset])
      } else {
        await setHealthFramework('fondos')
      }
      await completeOnboarding()
      await refetchUser()
      qc.invalidateQueries({ queryKey: ['funds'] })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setIsPending(false)
    }
  }

  return { complete, isPending, error }
}
```

- [ ] **Step 3: Create `FundRow.tsx`**

```tsx
import type { FundClassification } from '../../funds/types'

const CLASSIFICATION_LABEL: Record<FundClassification, string> = {
  available: 'Disponible',
  reserve: 'Reserva',
  committed: 'Comprometido',
}

const CLASSIFICATION_STYLE: Record<FundClassification, { bg: string; color: string }> = {
  available: { bg: 'var(--disp-bg)', color: 'var(--disp)' },
  reserve: { bg: 'var(--res-bg)', color: 'var(--res)' },
  committed: { bg: 'var(--comp-bg)', color: 'var(--comp)' },
}

interface Props {
  name: string
  classification: FundClassification
  onRemove?: () => void
}

export function FundRow({ name, classification, onRemove }: Props) {
  const style = CLASSIFICATION_STYLE[classification]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: style.bg, color: style.color }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 8l9 5 9-5" />
        </svg>
      </span>
      <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{name}</div>
      <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 7, background: style.bg, color: style.color }}>
        {CLASSIFICATION_LABEL[classification]}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ border: 'none', background: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, lineHeight: 0 }}
          aria-label="Eliminar fondo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `AddFundForm.tsx`**

```tsx
import { useState } from 'react'
import type { FundClassification, CreateFundPayload } from '../../funds/types'

const CLASSIFICATIONS: { value: FundClassification; label: string }[] = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserve', label: 'Reserva' },
  { value: 'committed', label: 'Comprometido' },
]

interface Props {
  onAdd: (fund: CreateFundPayload) => void
  onCancel: () => void
}

export function AddFundForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [classification, setClassification] = useState<FundClassification>('available')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, classification })
    setName('')
    setClassification('available')
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--tint)', display: 'flex', gap: 10, alignItems: 'center' }}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del fondo"
        maxLength={120}
        style={{ flex: 1, height: 38, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--field)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }}
      />
      <select
        value={classification}
        onChange={(e) => setClassification(e.target.value as FundClassification)}
        style={{ height: 38, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--field)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13.5 }}
      >
        {CLASSIFICATIONS.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <button type="submit" disabled={!name.trim()} style={{ height: 38, padding: '0 16px', border: 'none', borderRadius: 9, background: 'var(--disp)', color: '#fff', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed', opacity: name.trim() ? 1 : 0.5 }}>
        Agregar
      </button>
      <button type="button" onClick={onCancel} style={{ height: 38, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', color: 'var(--muted)', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer' }}>
        Cancelar
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Create `Step2Funds.tsx` (preset + fondos paths — Excel path added in Task 5)**

```tsx
import { useState } from 'react'
import type { PresetOption } from './Step1Preset'
import { FundRow } from '../components/FundRow'
import { AddFundForm } from '../components/AddFundForm'
import type { CreateFundPayload, FundClassification } from '../../funds/types'

interface PresetFundDef {
  name: string
  classification: FundClassification
}

const PRESET_FUNDS: Record<Exclude<PresetOption, 'fondos' | 'excel'>, PresetFundDef[]> = {
  jars_eker: [
    { name: 'Necesidades', classification: 'committed' },
    { name: 'Rico', classification: 'available' },
    { name: 'Educación', classification: 'committed' },
    { name: 'Inversión', classification: 'reserve' },
    { name: 'Emergencia', classification: 'reserve' },
    { name: 'Dar', classification: 'available' },
  ],
  '50_30_20': [
    { name: 'Necesidades', classification: 'committed' },
    { name: 'Deseos', classification: 'available' },
    { name: 'Ahorro', classification: 'reserve' },
  ],
  profit_first: [
    { name: 'Estilo de Vida', classification: 'available' },
    { name: 'Diversión / Experiencias', classification: 'available' },
    { name: 'Inversión / Ahorro', classification: 'reserve' },
    { name: 'Seguridad / Impuestos', classification: 'reserve' },
  ],
}

const PRESET_NAMES: Record<Exclude<PresetOption, 'fondos' | 'excel'>, string> = {
  jars_eker: 'Jars of Eker',
  '50_30_20': 'Regla 50/30/20',
  profit_first: 'Profit First',
}

interface Props {
  preset: PresetOption
  customFunds: CreateFundPayload[]
  onAddFund: (fund: CreateFundPayload) => void
  onRemoveFund: (index: number) => void
  onConfirm: () => void
  isPending: boolean
  error: string | null
}

export function Step2Funds({ preset, customFunds, onAddFund, onRemoveFund, onConfirm, isPending, error }: Props) {
  const [showAddForm, setShowAddForm] = useState(false)

  const isPreset = preset !== 'fondos' && preset !== 'excel'
  const presetFunds = isPreset ? PRESET_FUNDS[preset as Exclude<PresetOption, 'fondos' | 'excel'>] : []
  const presetName = isPreset ? PRESET_NAMES[preset as Exclude<PresetOption, 'fondos' | 'excel'>] : ''

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Paso 2 · Tus fondos
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginTop: 10 }}>
          {isPreset ? presetName : 'Fondos propios'}
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>
          {isPreset
            ? 'Estos son los fondos que crearemos. Cada uno con su clasificación.'
            : 'Agrega los fondos que quieras. Puedes crear más desde /fondos cuando lo necesites.'}
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isPreset && presetFunds.map((f, i) => (
          <FundRow key={i} name={f.name} classification={f.classification} />
        ))}

        {!isPreset && customFunds.map((f, i) => (
          <FundRow key={i} name={f.name} classification={f.classification} onRemove={() => onRemoveFund(i)} />
        ))}

        {!isPreset && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, border: '1px dashed var(--border-strong)', borderRadius: 12, color: 'var(--muted)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', background: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Agregar fondo
          </button>
        )}

        {!isPreset && showAddForm && (
          <AddFundForm
            onAdd={(fund) => { onAddFund(fund); setShowAddForm(false) }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>

      {error && (
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13.5, color: 'var(--neg)', fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```
git add apps/web/src/features/onboarding/api.ts
git add apps/web/src/features/onboarding/hooks/useCompleteOnboarding.ts
git add apps/web/src/features/onboarding/components/FundRow.tsx
git add apps/web/src/features/onboarding/components/AddFundForm.tsx
git add apps/web/src/features/onboarding/steps/Step2Funds.tsx
git commit -m "feat(onboarding): add Step2Funds, FundRow, AddFundForm, completion hook"
```

---

## Task 5: `Step2Funds` — Excel path embed

**Files:**
- Modify: `apps/web/src/features/onboarding/steps/Step2Funds.tsx`

**Interfaces:**
- Consumes: `UploadStep`, `PreviewStep` from `features/import-export/components/`
- Consumes: `useImportPreview`, `useImportCommit` from `features/import-export/hooks.ts`
- Consumes: `ImportPreviewResponseDto` from `features/import-export/types.ts`
- Consumes: `onExcelComplete: () => void` prop (called after successful commit)

- [ ] **Step 1: Update `Step2Funds.tsx` to handle Excel path**

Add the following imports at the top of `Step2Funds.tsx`:

```tsx
import { useState } from 'react'
import type { PresetOption } from './Step1Preset'
import { FundRow } from '../components/FundRow'
import { AddFundForm } from '../components/AddFundForm'
import type { CreateFundPayload, FundClassification } from '../../funds/types'
import { UploadStep } from '../../import-export/components/UploadStep'
import { PreviewStep } from '../../import-export/components/PreviewStep'
import { useImportPreview, useImportCommit } from '../../import-export/hooks'
import type { ImportPreviewResponseDto } from '../../import-export/types'
```

Update the `Props` interface to add `onExcelComplete`:

```tsx
interface Props {
  preset: PresetOption
  customFunds: CreateFundPayload[]
  onAddFund: (fund: CreateFundPayload) => void
  onRemoveFund: (index: number) => void
  onConfirm: () => void
  onExcelComplete: () => void
  isPending: boolean
  error: string | null
}
```

Inside the `Step2Funds` component, add Excel-specific state and handlers after the existing `showAddForm` state:

```tsx
const [excelPreviewData, setExcelPreviewData] = useState<ImportPreviewResponseDto | null>(null)
const [approvedFunds, setApprovedFunds] = useState<Set<string>>(new Set())
const previewMutation = useImportPreview()
const commitMutation = useImportCommit()

function handleExcelFileReady(file: File) {
  previewMutation.mutate(file, {
    onSuccess: (data) => {
      setExcelPreviewData(data)
      setApprovedFunds(new Set(data.unknownFunds))
    },
  })
}

function handleToggleFund(name: string) {
  setApprovedFunds((prev) => {
    const next = new Set(prev)
    if (next.has(name)) { next.delete(name) } else { next.add(name) }
    return next
  })
}

function handleExcelBack() {
  previewMutation.reset()
  setExcelPreviewData(null)
  setApprovedFunds(new Set())
}

function handleExcelConfirm() {
  if (!excelPreviewData) return
  const rowsToCommit = excelPreviewData.rows.filter(
    (row) => !row.duplicate && (!excelPreviewData.unknownFunds.includes(row.fundName) || approvedFunds.has(row.fundName)),
  )
  commitMutation.mutate(rowsToCommit, {
    onSuccess: () => onExcelComplete(),
  })
}
```

Replace the `return (...)` block with one that handles the `excel` path:

```tsx
if (preset === 'excel') {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Paso 2 · Importar historial
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginTop: 10 }}>
          Importar Excel
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>
          Sube tu archivo para detectar fondos y transacciones automáticamente.
        </div>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {!excelPreviewData ? (
          <UploadStep
            onFileReady={handleExcelFileReady}
            isPending={previewMutation.isPending}
            error={previewMutation.error?.message ?? null}
          />
        ) : (
          <PreviewStep
            previewData={excelPreviewData}
            approvedFunds={approvedFunds}
            onToggleFund={handleToggleFund}
            onBack={handleExcelBack}
            onConfirm={handleExcelConfirm}
            isPending={commitMutation.isPending}
            error={commitMutation.error?.message ?? null}
          />
        )}
      </div>
    </div>
  )
}
```

The existing non-Excel return block stays below this early return.

- [ ] **Step 2: Commit**

```
git add apps/web/src/features/onboarding/steps/Step2Funds.tsx
git commit -m "feat(onboarding): embed Excel import in Step2Funds"
```

---

## Task 6: `Step3Success` + `OnboardingPage` orchestration

**Files:**
- Create: `apps/web/src/features/onboarding/steps/Step3Success.tsx`
- Modify: `apps/web/src/features/onboarding/OnboardingPage.tsx` (replace skeleton with full implementation)
- Modify: `apps/web/src/features/onboarding/index.ts` (no change needed if already exports `OnboardingPage`)

**Interfaces:**
- Consumes: `Step1Preset`, `Step2Funds`, `Step3Success`, `useCompleteOnboarding`, `createFund` (api.ts), `useAuth`
- Produces: complete 3-step onboarding flow

- [ ] **Step 1: Create `Step3Success.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'

const PRESET_NAMES: Record<string, string> = {
  jars_eker: 'Jars of Eker',
  '50_30_20': 'Regla 50/30/20',
  profit_first: 'Profit First',
  fondos: 'Fondos propios',
  excel: 'importación Excel',
}

interface Props {
  preset: string
  displayName: string | null
}

export function Step3Success({ preset, displayName }: Props) {
  const navigate = useNavigate()
  const name = displayName ?? 'ahí'
  const presetName = PRESET_NAMES[preset] ?? preset

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 78, height: 78, borderRadius: 22, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-lg)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)' }}>
        Todo listo, {name}.
      </div>
      <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 10, maxWidth: 440, margin: '10px auto 0' }}>
        Tu espacio con <b style={{ color: 'var(--text)' }}>{presetName}</b> está creado. Registra tu primer movimiento o importa tu historial cuando quieras.
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '32px 0 8px' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>$0</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>patrimonio inicial</div>
        </div>
        <div style={{ width: 1, background: 'var(--border)' }} />
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, fontVariantNumeric: 'tabular-nums', background: 'var(--grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>CLP</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>moneda</div>
        </div>
      </div>
      <button
        onClick={() => navigate('/')}
        style={{ marginTop: 8, height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)' }}
      >
        Ir al dashboard
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Replace `OnboardingPage.tsx` with full implementation**

```tsx
import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { createFund } from './api'
import { useCompleteOnboarding } from './hooks/useCompleteOnboarding'
import { Step1Preset, type PresetOption } from './steps/Step1Preset'
import { Step2Funds } from './steps/Step2Funds'
import { Step3Success } from './steps/Step3Success'
import type { CreateFundPayload } from '../funds/types'

export function OnboardingPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selected, setSelected] = useState<PresetOption | null>(null)
  const [customFunds, setCustomFunds] = useState<CreateFundPayload[]>([])
  const [addFundError, setAddFundError] = useState<string | null>(null)

  const { complete, isPending, error } = useCompleteOnboarding()

  async function handleAddFund(fund: CreateFundPayload) {
    setAddFundError(null)
    try {
      await createFund(fund)
      setCustomFunds((prev) => [...prev, fund])
    } catch (err) {
      setAddFundError(err instanceof Error ? err.message : 'No se pudo crear el fondo.')
    }
  }

  function handleRemoveFund(index: number) {
    setCustomFunds((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleConfirmStep2() {
    if (!selected) return
    await complete(selected)
  }

  async function handleExcelComplete() {
    if (!selected) return
    await complete(selected)
  }

  const showBack = step === 2
  const nextLabel = step === 1 ? 'Siguiente' : step === 2 ? (isPending ? 'Configurando…' : 'Confirmar') : 'Ir al dashboard'

  function handleNext() {
    if (step === 1 && selected) {
      setStep(2)
    }
  }

  const dots = [1, 2, 3].map((n) => ({
    width: n === step ? 24 : 8,
    active: n === step,
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.02em', color: 'var(--text)' }}>Wealet</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {dots.map((d, i) => (
            <span
              key={i}
              style={{ height: 8, borderRadius: 4, transition: 'width .25s, background .25s', width: d.width, background: d.active ? 'var(--disp)' : 'var(--border-strong)' }}
            />
          ))}
        </div>
        <button
          onClick={() => window.location.href = '/login'}
          style={{ border: 'none', background: 'none', color: 'var(--muted)', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer' }}
        >
          Salir
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 24px 48px' }}>
        <div style={{ width: '100%', maxWidth: 780 }}>
          {step === 1 && (
            <Step1Preset selected={selected} onSelect={setSelected} />
          )}
          {step === 2 && selected && (
            <Step2Funds
              preset={selected}
              customFunds={customFunds}
              onAddFund={handleAddFund}
              onRemoveFund={handleRemoveFund}
              onConfirm={handleConfirmStep2}
              onExcelComplete={handleExcelComplete}
              isPending={isPending}
              error={error ?? addFundError}
            />
          )}
          {step === 3 && selected && (
            <Step3Success preset={selected} displayName={user?.displayName ?? null} />
          )}

          {/* Nav footer — hidden on step 3 and for Excel path step 2 (PreviewStep has its own buttons) */}
          {step !== 3 && !(step === 2 && selected === 'excel') && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 36 }}>
              {showBack && (
                <button
                  onClick={() => setStep(1)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, height: 46, padding: '0 22px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                  Atrás
                </button>
              )}
              {step === 1 && (
                <button
                  onClick={handleNext}
                  disabled={!selected}
                  style={{ height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: selected ? 'var(--grad)' : 'var(--border)', color: selected ? '#fff' : 'var(--muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: selected ? 'pointer' : 'not-allowed', boxShadow: selected ? 'var(--shadow)' : 'none', transition: 'all .15s' }}
                >
                  {nextLabel}
                </button>
              )}
              {step === 2 && selected !== 'excel' && (
                <button
                  onClick={handleConfirmStep2}
                  disabled={isPending}
                  style={{ height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1, boxShadow: 'var(--shadow)' }}
                >
                  {isPending ? 'Configurando…' : 'Confirmar'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

Note: `useCompleteOnboarding` calls `navigate('/')` after success. Since `ProtectedRoute` now checks `onboardingCompleted`, the user will pass through to the dashboard after `refetchUser()` updates the user object. The `step === 3` branch in `OnboardingPage` will never be rendered because the navigation happens in the hook. Remove the Step3 state advancement from `complete()` if the navigate is immediate, OR set `step` to 3 before calling `complete()` to show the success screen briefly.

Update `useCompleteOnboarding.ts` to NOT navigate automatically — instead return a `done` flag:

```ts
// In useCompleteOnboarding.ts — replace navigate('/') with:
// return true from complete() to signal OnboardingPage to go to step 3
```

Actually, the cleaner approach: `useCompleteOnboarding` does NOT call `navigate`. It calls `refetchUser()` but the navigation is handled by `OnboardingPage` — it sets `step` to 3, shows the success screen, and the "Ir al dashboard" button in `Step3Success` calls `navigate('/')`. Update `useCompleteOnboarding.ts`:

```ts
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { completeOnboarding, createPresetFunds, setHealthFramework } from '../api'
import type { PresetOption } from '../steps/Step1Preset'

const PRESET_TO_FRAMEWORK = {
  jars_eker: 'jars_eker' as const,
  '50_30_20': '50_30_20' as const,
  profit_first: 'profit_first' as const,
}

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  const { refetchUser } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function complete(preset: PresetOption): Promise<boolean> {
    setIsPending(true)
    setError(null)
    try {
      if (preset === 'jars_eker' || preset === '50_30_20' || preset === 'profit_first') {
        await createPresetFunds(preset)
        await setHealthFramework(PRESET_TO_FRAMEWORK[preset])
      } else {
        await setHealthFramework('fondos')
      }
      await completeOnboarding()
      await refetchUser()
      qc.invalidateQueries({ queryKey: ['funds'] })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.')
      return false
    } finally {
      setIsPending(false)
    }
  }

  return { complete, isPending, error }
}
```

Update `handleConfirmStep2` and `handleExcelComplete` in `OnboardingPage.tsx` to use the `boolean` return:

```tsx
async function handleConfirmStep2() {
  if (!selected) return
  const ok = await complete(selected)
  if (ok) setStep(3)
}

async function handleExcelComplete() {
  if (!selected) return
  const ok = await complete(selected)
  if (ok) setStep(3)
}
```

- [ ] **Step 3: Run type-check and lint**

```
pnpm type-check
pnpm lint
```

Fix any errors before continuing.

- [ ] **Step 4: Manual end-to-end test**

Start `pnpm --filter api dev` and `pnpm --filter web dev`.

Test each path:
1. Register new account → redirected to `/onboarding`
2. Select `jars_eker` → Step 2 shows 6 funds (read-only) → Confirmar → Step 3 success → "Ir al dashboard" lands on `/`; subsequent navigation stays in app
3. Repeat with `50_30_20` (fresh account or clear DB): 3 funds
4. Repeat with `profit_first`: 4 funds with correct names
5. Repeat with `fondos propios`: empty list, add 2 funds with Agregar, Confirmar → dashboard
6. Repeat with `excel`: Step 2 shows UploadStep, upload a .xlsx, preview renders, Confirmar → Step 3 → dashboard

- [ ] **Step 5: Commit**

```
git add apps/web/src/features/onboarding/steps/Step3Success.tsx
git add apps/web/src/features/onboarding/OnboardingPage.tsx
git add apps/web/src/features/onboarding/hooks/useCompleteOnboarding.ts
git commit -m "feat(onboarding): complete OnboardingPage orchestration and Step3Success"
```

---

## Task 7: Empty states verification

**Files:** No new files — verification only.

- [ ] **Step 1: Verify `/fondos` with 0 funds**

Log in with a `fondos propios` account that has 0 funds. Navigate to `/fondos`. Expected: empty state renders without errors (no JS console errors).

- [ ] **Step 2: Verify `/transacciones` with 0 activity**

Navigate to `/transacciones`. Expected: empty timeline, no errors.

- [ ] **Step 3: Verify `/transferencias` with 0 funds**

Navigate to `/transferencias`. Open "Nueva transferencia". Expected: fund selectors show empty state or disabled state gracefully — no crash.

- [ ] **Step 4: Verify `/salud` with no assessment data**

Navigate to `/salud`. Expected: empty or placeholder state for assessment — no crash.

- [ ] **Step 5: Fix any broken empty states found**

If any screen crashes or shows raw errors, fix the empty-state handling in that screen's component before marking this task complete.

- [ ] **Step 6: Update `docs/modules.md` Estado actual**

Add a bullet under Estado actual:

```
- **Onboarding implementado**: wizard full-screen de 3 pasos — selección de preset (jars_eker, 50/30/20, profit_first, fondos propios, Excel), preview de fondos, pantalla de éxito. `ProtectedRoute` redirige a `/onboarding` si `onboardingCompleted = false`. El preset `sobres` fue renombrado a `profit_first` con nuevos fondos (Estilo de Vida / Diversión / Inversión / Seguridad) y su propio framework con slots predefinidos.
```

- [ ] **Step 7: Final commit**

```
git add docs/modules.md
git commit -m "docs: update modules.md with onboarding and profit_first framework"
```
