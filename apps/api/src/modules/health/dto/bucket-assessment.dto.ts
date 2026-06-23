export class BucketAssessmentDto {
  classification: 'available' | 'reserve' | 'committed';
  targetPercentage: number;
  actualPercentage: number;
  actualAmount: string;
}
