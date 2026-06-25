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
