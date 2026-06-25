import { apiFetch } from '../../lib/api/client'
import type { Fund } from './types'

export function listFunds(): Promise<Fund[]> {
  return apiFetch<Fund[]>('/funds')
}
