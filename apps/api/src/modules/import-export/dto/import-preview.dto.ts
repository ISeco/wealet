import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class ImportPreviewDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
