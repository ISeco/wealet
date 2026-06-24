import { IsDateString } from 'class-validator';

export class ExportQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
