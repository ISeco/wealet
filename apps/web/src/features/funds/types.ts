export type FundClassification = 'available' | 'reserve' | 'committed'

export interface Fund {
  id: string
  name: string
  classification: FundClassification
  color: string | null
  isOperative: boolean
  countsForRunway: boolean
  targetPercentage: number | null
  archivedAt: string | null
  balance: string
  balanceFormatted: string
  createdAt: string
  updatedAt: string
}

export interface FundHistoryPoint {
  month: string
  balance: string
}

export interface CreateFundPayload {
  name: string
  classification: FundClassification
  color?: string
  countsForRunway?: boolean
  targetPercentage?: number
}

export type UpdateFundPayload = Partial<CreateFundPayload>
