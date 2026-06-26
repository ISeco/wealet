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

export interface CreateTransferPayload {
  fromFundId: string
  toFundId: string
  amount: string
  currency?: string
  occurredOn: string
  note?: string
}
