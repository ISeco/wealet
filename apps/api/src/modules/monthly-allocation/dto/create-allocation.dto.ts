import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumberString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class DistributionItemDto {
  @IsUUID()
  fundId: string;

  @IsNumberString()
  amount: string;
}

export class CreateAllocationDto {
  @IsNumberString()
  totalAmount: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DistributionItemDto)
  distributions: DistributionItemDto[];
}
