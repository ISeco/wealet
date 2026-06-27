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

export class UpdateFundDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEnum(FundClassification)
  classification?: FundClassification;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  targetPercentage?: number;
}
