// apps/web/src/app/router.tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage, ProtectedRoute } from '../features/auth'
import { CategoriesPage } from '../features/categories'
import { FundsPage, FundDetailPage } from '../features/funds'
import { TransactionsPage } from '../features/transactions'
import { TransfersPage } from '../features/transfers'
import { AppLayout } from './AppLayout'
import { HomePlaceholder } from './HomePlaceholder'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePlaceholder />} />
            <Route path="/fondos" element={<FundsPage />} />
            <Route path="/fondos/:id" element={<FundDetailPage />} />
            <Route path="/transacciones" element={<TransactionsPage />} />
            <Route path="/transferencias" element={<TransfersPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
