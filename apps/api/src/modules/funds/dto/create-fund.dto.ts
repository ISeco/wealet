import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
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
  countsForRunway?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  targetPercentage?: number;
}
