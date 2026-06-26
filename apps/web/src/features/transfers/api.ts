import { apiFetch } from '../../lib/api/client'
import type { CreateTransferPayload, PaginatedTransfers, Transfer, TransferQuery } from './types'

function toQueryString(query: TransferQuery): string {
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
  return apiFetch<PaginatedTransfers>(`/transfers${toQueryString(query)}`)
}

export function createTransfer(payload: CreateTransferPayload): Promise<Transfer> {
  return apiFetch<Transfer>('/transfers', { method: 'POST', body: payload })
}
