import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../../common/money/currency';
import { IsNotFutureDate } from '../../../common/validators/is-not-future-date.validator';

export class CreateTransferDto {
  @IsUUID()
  fromFundId: string;

  @IsUUID()
  toFundId: string;

  @Matches(/^[0-9]+$/, {
    message: 'amount must be a non-negative integer string (minor units)',
  })
  amount: string;

  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: string;

  @IsDateString()
  @IsNotFutureDate()
  occurredOn: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
