import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../../common/money/currency';
import { TransactionType } from '../../../common/enums/transaction-type.enum';
import { IsNotFutureDate } from '../../../common/validators/is-not-future-date.validator';

export class CreateTransactionDto {
  @IsUUID()
  fundId: string;

  @IsUUID()
  categoryId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @Matches(/^[0-9]+$/, {
    message: 'amount must be a non-negative integer string (minor units)',
  })
  amount: string;

  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  @IsNotFutureDate()
  occurredOn: string;
}
