import { apiFetch } from '../../lib/api/client'
import type {
  CreateTransactionPayload,
  PaginatedTransactions,
  PaginatedTransfers,
  Transaction,
  TransactionQuery,
  TransferQuery,
  UpdateTransactionPayload,
} from './types'

function toQueryString(query: TransactionQuery): string {
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

function toTransferQueryString(query: TransferQuery): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function listTransfers(query: TransferQuery): Promise<PaginatedTransfers> {
  return apiFetch<PaginatedTransfers>(`/transfers${toTransferQueryString(query)}`)
}
