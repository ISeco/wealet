export type TransactionType = 'income' | 'expense'

export interface ImportRowDto {
  sheet: string
  cell: string
  fundName: string
  amount: string
  type: TransactionType
  description: string | null
  occurredOn: string
  dedupeHash: string
  duplicate?: boolean
}

export interface OpeningBalanceDto {
  sheet: string
  fundName: string
  amount: string
}

export interface ParseErrorDto {
  sheet: string
  cell: string
  message: string
}

export interface ImportPreviewResponseDto {
  rows: ImportRowDto[]
  openingBalances: OpeningBalanceDto[]
  unknownFunds: string[]
  errors: ParseErrorDto[]
  needsYear: boolean
}

export interface ImportCommitResultDto {
  imported: number
  skippedDuplicates: number
  createdFunds: string[]
}
