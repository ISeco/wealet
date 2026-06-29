import { apiFetch } from '../../lib/api/client'
import type { AssessmentResponse, HealthFramework, HealthProfile } from './types'

export function getHealthProfile(): Promise<HealthProfile> {
  return apiFetch<HealthProfile>('/health/profile')
}

export function getHealthAssessment(month?: string): Promise<AssessmentResponse> {
  if (!month) return apiFetch<AssessmentResponse>('/health/assessment')
  const [y, m] = month.split('-')
  const from = `${y}-${m}-01`
  const to = `${y}-${m}-${String(new Date(+y, +m, 0).getDate()).padStart(2, '0')}`
  return apiFetch<AssessmentResponse>(`/health/assessment?from=${from}&to=${to}`)
}

export function updateHealthProfile(framework: HealthFramework): Promise<HealthProfile> {
  return apiFetch<HealthProfile>('/health/profile', {
    method: 'PUT',
    body: { framework },
  })
}

export function updateMonthlyIncome(monthlyIncome: string): Promise<HealthProfile> {
  return apiFetch<HealthProfile>('/health/profile', {
    method: 'PUT',
    body: { monthlyIncome },
  })
}
