import { apiFetch } from '../../lib/api/client'
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
