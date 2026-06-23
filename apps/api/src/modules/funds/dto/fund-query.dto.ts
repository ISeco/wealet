import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export class FundQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeArchived?: boolean = false;
}
