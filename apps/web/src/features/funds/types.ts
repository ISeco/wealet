export type FundClassification = 'available' | 'reserve' | 'committed'

export interface Fund {
  id: string
  name: string
  classification: FundClassification
  color: string | null
  isOperative: boolean
  countsForRunway: boolean
  archivedAt: string | null
  balance: string
  balanceFormatted: string
  createdAt: string
  updatedAt: string
}
