import { HealthFramework } from '../entities/health-profile.entity';
import { FundAssessmentDto } from './bucket-assessment.dto';

export class AssessmentResponseDto {
  framework: HealthFramework;
  totalIncome: string;
  funds: FundAssessmentDto[];
}
