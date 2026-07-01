export class FundAssessmentDto {
  fundId: string;
  fundName: string;
  classification: 'available' | 'reserve' | 'committed';
  frameworkSlot: string | null;
  targetPercentage: number;
  actualPercentage: number;
  actualAmount: string;
}
