import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionType } from '../../../common/enums/transaction-type.enum';

export class ImportRowDto {
  @IsString()
  sheet: string;

  @IsString()
  cell: string;

  @IsString()
  fundName: string;

  @IsNumberString()
  amount: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsDateString()
  occurredOn: string;

  @IsString()
  dedupeHash: string;

  @IsOptional()
  @IsBoolean()
  duplicate?: boolean;
}
