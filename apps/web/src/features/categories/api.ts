import { apiFetch } from '../../lib/api/client'
import type { Category } from './types'

export function listCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories')
}
