export type TransactionType = 'income' | 'expense'
export type TransactionSource = 'manual' | 'import'

export interface Transaction {
  id: string
  fundId: string
  categoryId: string
  type: TransactionType
  amount: string
  amountFormatted: string
  currency: string
  description: string | null
  occurredOn: string
  source: TransactionSource
  createdAt: string
  updatedAt: string
}

export interface PaginatedTransactions {
  data: Transaction[]
  total: number
  page: number
  limit: number
}

export interface TransactionQuery {
  from?: string
  to?: string
  type?: TransactionType
  categoryId?: string
  fundId?: string
  q?: string
  page?: number
  limit?: number
}

export interface CreateTransactionPayload {
  fundId: string
  categoryId: string
  type: TransactionType
  amount: string
  currency?: string
  description?: string
  occurredOn: string
}

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>

export interface TransactionFilters {
  fundId?: string
  categoryId?: string
  from?: string
  to?: string
}

export type ActivityType = 'transaction' | 'transfer'
export type ActivitySubtype = 'income' | 'expense'

export interface ActivityItem {
  type: ActivityType
  id: string
  amount: string
  amountFormatted: string
  currency: string
  occurredOn: string
  createdAt: string
  // transaction-specific
  description?: string | null
  subtype?: ActivitySubtype
  fundId?: string
  categoryId?: string
  source?: TransactionSource
  updatedAt?: string
  // transfer-specific
  fromFundId?: string
  toFundId?: string
  note?: string | null
}

export interface PaginatedActivity {
  data: ActivityItem[]
  total: number
  page: number
  limit: number
}

export interface ActivityQuery {
  from?: string
  to?: string
  type?: ActivityType
  subtype?: ActivitySubtype
  fundId?: string
  categoryId?: string
  q?: string
  page?: number
  limit?: number
}
