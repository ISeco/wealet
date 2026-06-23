import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { FundClassification } from '../entities/fund.entity';

export class CreateFundDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsEnum(FundClassification)
  classification: FundClassification;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;

  @IsOptional()
  @IsBoolean()
  isOperative?: boolean;

  @IsOptional()
  @IsBoolean()
  countsForRunway?: boolean;
}
