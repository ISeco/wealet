export type HealthFramework = '50_30_20' | 'jars_eker' | 'fondos'
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
  totalIncome: string
  funds: FundAssessment[]
}
