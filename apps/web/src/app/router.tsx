// apps/web/src/app/router.tsx
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
