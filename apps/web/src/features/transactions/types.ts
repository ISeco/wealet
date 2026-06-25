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

export interface Transfer {
  id: string
  fromFundId: string
  toFundId: string
  amount: string
  amountFormatted: string
  currency: string
  note: string | null
  occurredOn: string
  createdAt: string
}

export interface PaginatedTransfers {
  data: Transfer[]
  total: number
  page: number
  limit: number
}

export interface TransferQuery {
  from?: string
  to?: string
  page?: number
  limit?: number
}
