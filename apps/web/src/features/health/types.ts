export type HealthFramework = '50_30_20' | 'jars_eker' | 'profit_first' | 'fondos'
export type FundClassification = 'available' | 'reserve' | 'committed'

export interface HealthProfile {
  id: string
  framework: HealthFramework
  monthlyIncome: string | null
}

export interface FundAssessment {
  fundId: string
  fundName: string
  classification: FundClassification
  frameworkSlot: string | null
  targetPercentage: number
  actualPercentage: number
  actualAmount: string
}

export interface AssessmentResponse {
  framework: HealthFramework
  /** Period income for flow-based frameworks; total fund balance for FONDOS. */
  totalBase: string
  funds: FundAssessment[]
}
