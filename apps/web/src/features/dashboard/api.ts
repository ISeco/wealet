import { apiFetch } from '../../lib/api/client'
import type { PaginatedActivity } from '../transactions/types'
import type { CashFlowPoint, CategorySpend, NetWorthResponse, RunwayResponse, SummaryResponse } from './types'

export function getReportMonths(): Promise<string[]> {
  return apiFetch<string[]>('/reports/months')
}

export function getSummary(month: string): Promise<SummaryResponse> {
  return apiFetch<SummaryResponse>(`/reports/summary?month=${month}`)
}

export function getNetWorth(month?: string): Promise<NetWorthResponse> {
  const qs = month ? `?month=${month}` : ''
  return apiFetch<NetWorthResponse>(`/reports/net-worth${qs}`)
}

export function getCashFlow(months = 6): Promise<CashFlowPoint[]> {
  return apiFetch<CashFlowPoint[]>(`/reports/cash-flow?months=${months}`)
}

export function getByCategory(month: string): Promise<CategorySpend[]> {
  return apiFetch<CategorySpend[]>(`/reports/by-category?month=${month}`)
}

export function getRunway(): Promise<RunwayResponse> {
  return apiFetch<RunwayResponse>('/reports/runway')
}

export function getRecentActivity(): Promise<PaginatedActivity> {
  return apiFetch<PaginatedActivity>('/activity?limit=6&page=1')
}
