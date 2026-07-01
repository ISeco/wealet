import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TransactionType } from '../../../common/enums/transaction-type.enum';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;
}
