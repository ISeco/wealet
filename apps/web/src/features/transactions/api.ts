import { apiFetch } from '../../lib/api/client'
import { API_BASE_URL } from '../../lib/api/config'
import { getAccessToken } from '../../lib/api/tokenStore'
import type {
  ActivityQuery,
  CreateTransactionPayload,
  PaginatedActivity,
  PaginatedTransactions,
  Transaction,
  TransactionQuery,
  UpdateTransactionPayload,
} from './types'

function toQueryString(query: object): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function listTransactions(query: TransactionQuery): Promise<PaginatedTransactions> {
  return apiFetch<PaginatedTransactions>(`/transactions${toQueryString(query)}`)
}

export function createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  return apiFetch<Transaction>('/transactions', { method: 'POST', body: payload })
}

export function updateTransaction(id: string, payload: UpdateTransactionPayload): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: payload })
}

export function deleteTransaction(id: string): Promise<void> {
  return apiFetch<void>(`/transactions/${id}`, { method: 'DELETE' })
}

export function listActivity(query: ActivityQuery): Promise<PaginatedActivity> {
  return apiFetch<PaginatedActivity>(`/activity${toQueryString(query)}`)
}

export async function exportTransactions(from?: string, to?: string): Promise<void> {
  const params = new URLSearchParams()
  if (from) { params.set('from', from) }
  if (to) { params.set('to', to) }
  const qs = params.toString() ? `?${params.toString()}` : ''
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/export${qs}`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error('Error al exportar')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const suffix = from || to ? `-${from ?? ''}-${to ?? ''}` : ''
  a.download = `wealet-export${suffix}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
