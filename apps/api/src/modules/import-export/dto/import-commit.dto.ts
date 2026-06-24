import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';
import { ImportRowDto } from './import-row.dto';

export class ImportCommitDto {
  @ValidateNested({ each: true })
  @Type(() => ImportRowDto)
  @ArrayMinSize(1)
  rows: ImportRowDto[];
}
