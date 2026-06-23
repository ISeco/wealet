import { HealthFramework } from '../entities/health-profile.entity';
import { BucketAssessmentDto } from './bucket-assessment.dto';

export class AssessmentResponseDto {
  framework: HealthFramework;
  totalIncome: string;
  buckets: BucketAssessmentDto[];
}
