import { apiFetch } from '../../lib/api/client'
import type { CreateFundPayload } from '../funds/types'

type Framework = 'jars_eker' | '50_30_20' | 'profit_first' | 'fondos'

export function createPresetFunds(preset: 'jars_eker' | '50_30_20' | 'profit_first') {
  return apiFetch<void>('/funds/preset', { method: 'POST', body: { preset } })
}

export function setHealthFramework(framework: Framework) {
  return apiFetch<void>('/health/profile', { method: 'PUT', body: { framework } })
}

export function completeOnboarding() {
  return apiFetch<void>('/users/me', { method: 'PATCH', body: { onboardingCompleted: true } })
}

export function createFund(payload: CreateFundPayload) {
  return apiFetch<{ id: string }>('/funds', { method: 'POST', body: payload })
}
