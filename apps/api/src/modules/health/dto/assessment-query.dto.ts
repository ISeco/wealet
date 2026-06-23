import { IsDateString } from 'class-validator';

export class AssessmentQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
