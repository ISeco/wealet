import { IsUUID } from 'class-validator';

export class FundMonthsQueryDto {
  @IsUUID()
  fundId: string;
}
