import { IsDateString, IsOptional } from 'class-validator';

export class TransferQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
