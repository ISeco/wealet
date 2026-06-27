import { IsDateString, IsOptional } from 'class-validator';

export class AssessmentQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
