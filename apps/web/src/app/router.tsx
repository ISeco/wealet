import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage, ProtectedRoute } from '../features/auth'
import { TransactionsPage } from '../features/transactions'
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
            <Route path="/transacciones" element={<TransactionsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
