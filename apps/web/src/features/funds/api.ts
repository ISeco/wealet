import { apiFetch } from '../../lib/api/client'
import type { CreateFundPayload, Fund, FundHistoryPoint, UpdateFundPayload } from './types'

export function listFunds(includeArchived = false): Promise<Fund[]> {
  const qs = includeArchived ? '?includeArchived=true' : ''
  return apiFetch<Fund[]>(`/funds${qs}`)
}

export function getFund(id: string): Promise<Fund> {
  return apiFetch<Fund>(`/funds/${id}`)
}

export function getFundHistory(id: string, months = 12): Promise<FundHistoryPoint[]> {
  return apiFetch<FundHistoryPoint[]>(`/funds/${id}/history?months=${months}`)
}

export function createFund(payload: CreateFundPayload): Promise<Fund> {
  return apiFetch<Fund>('/funds', { method: 'POST', body: payload })
}

export function updateFund(id: string, payload: UpdateFundPayload): Promise<Fund> {
  return apiFetch<Fund>(`/funds/${id}`, { method: 'PATCH', body: payload })
}

export function deleteFund(id: string): Promise<void> {
  return apiFetch<void>(`/funds/${id}`, { method: 'DELETE' })
}
