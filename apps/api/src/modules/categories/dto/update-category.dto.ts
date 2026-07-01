import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TransactionType } from '../../../common/enums/transaction-type.enum';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;
}
