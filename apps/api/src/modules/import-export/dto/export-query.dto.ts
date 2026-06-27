import { IsDateString, IsOptional } from 'class-validator';

export class ExportQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
