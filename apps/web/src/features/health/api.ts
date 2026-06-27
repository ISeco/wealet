import { apiFetch } from '../../lib/api/client'
import type { AssessmentResponse, HealthFramework, HealthProfile } from './types'

export function getHealthProfile(): Promise<HealthProfile> {
  return apiFetch<HealthProfile>('/health/profile')
}

export function getHealthAssessment(month?: string): Promise<AssessmentResponse> {
  const qs = month ? `?month=${month}` : ''
  return apiFetch<AssessmentResponse>(`/health/assessment${qs}`)
}

export function updateHealthProfile(framework: HealthFramework): Promise<HealthProfile> {
  return apiFetch<HealthProfile>('/health/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ framework }),
  })
}
