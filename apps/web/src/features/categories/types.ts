export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  type: CategoryType
  color: string | null
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryPayload {
  name: string
  type: CategoryType
  color?: string | null
}

export interface UpdateCategoryPayload {
  name?: string
  type?: CategoryType
  color?: string | null
}
