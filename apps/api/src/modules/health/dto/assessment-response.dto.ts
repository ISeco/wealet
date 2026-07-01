import { HealthFramework } from '../entities/health-profile.entity';
import { FundAssessmentDto } from './bucket-assessment.dto';

export class AssessmentResponseDto {
  framework: HealthFramework;
  /** Period income for flow-based frameworks; total fund balance for FONDOS. */
  totalBase: string;
  funds: FundAssessmentDto[];
}
