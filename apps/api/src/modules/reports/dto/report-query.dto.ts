import { IsDateString } from 'class-validator';

export class ReportQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
