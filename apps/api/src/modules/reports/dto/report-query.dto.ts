import { IsDateString, IsOptional } from 'class-validator';
import { MonthQueryDto } from './month-query.dto';

export class ReportQueryDto extends MonthQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
