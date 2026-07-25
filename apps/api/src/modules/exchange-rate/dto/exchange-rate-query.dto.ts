import { IsIn } from 'class-validator';

export class ExchangeRateQueryDto {
  @IsIn(['USD', 'EUR'])
  from: string;
}
