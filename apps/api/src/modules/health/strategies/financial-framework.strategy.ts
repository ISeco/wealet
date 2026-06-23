export interface ClassificationTargets {
  available: number;
  reserve: number;
  committed: number;
}

export interface FinancialFrameworkStrategy {
  getDefaultTargets(): ClassificationTargets;
}
