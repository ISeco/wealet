export interface NetWorthResponse {
  available: string
  reserve: string
  committed: string
  total: string
  previousTotal?: string
  changePercent?: number | null
}

export interface SummaryResponse {
  balance: string
  income: string
  expense: string
  previousExpense?: string
  expenseChangePercent?: number | null
}

export interface CashFlowPoint {
  month: string
  income: string
  expense: string
}

export interface CategorySpend {
  categoryId: string
  categoryName: string
  color: string | null
  amount: string
}

export interface RunwayResponse {
  cushion: string
  monthlyBurn: string
  months: number | null
}
