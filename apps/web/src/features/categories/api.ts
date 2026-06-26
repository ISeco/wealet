import { apiFetch } from '../../lib/api/client'
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from './types'

export function listCategories(scope?: 'mine' | 'system' | 'all'): Promise<Category[]> {
  const qs = scope ? `?scope=${scope}` : ''
  return apiFetch<Category[]>(`/categories${qs}`)
}

export function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  return apiFetch<Category>('/categories', { method: 'POST', body: payload })
}

export function updateCategory(id: string, payload: UpdateCategoryPayload): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', body: payload })
}

export function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, { method: 'DELETE' })
}
