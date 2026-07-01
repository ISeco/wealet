import { Type } from 'class-transformer';
import { IsArray, IsUUID, Matches, ValidateNested } from 'class-validator';

export class DistributionItemDto {
  @IsUUID()
  fundId: string;

  @Matches(/^\d+$/)
  amount: string;
}

export class CreateAllocationDto {
  @Matches(/^\d+$/)
  totalAmount: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DistributionItemDto)
  distributions: DistributionItemDto[];
}
