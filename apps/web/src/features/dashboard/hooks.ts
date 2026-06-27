import { useQuery } from '@tanstack/react-query'
import * as api from './api'

export function useReportMonths() {
  return useQuery({
    queryKey: ['reports', 'months'],
    queryFn: api.getReportMonths,
  })
}

export function useSummary(month: string) {
  return useQuery({
    queryKey: ['reports', 'summary', month],
    queryFn: () => api.getSummary(month),
    enabled: !!month,
  })
}

export function useNetWorth(month?: string) {
  return useQuery({
    queryKey: ['reports', 'net-worth', month ?? 'all'],
    queryFn: () => api.getNetWorth(month),
  })
}

export function useCashFlow(months = 6) {
  return useQuery({
    queryKey: ['reports', 'cash-flow', months],
    queryFn: () => api.getCashFlow(months),
  })
}

export function useByCategory(month: string) {
  return useQuery({
    queryKey: ['reports', 'by-category', month],
    queryFn: () => api.getByCategory(month),
    enabled: !!month,
  })
}

export function useRunway() {
  return useQuery({
    queryKey: ['reports', 'runway'],
    queryFn: api.getRunway,
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['activity', { limit: 6, page: 1 }],
    queryFn: api.getRecentActivity,
  })
}
