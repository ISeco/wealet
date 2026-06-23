import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { HealthFramework } from '../entities/health-profile.entity';
import { ClassificationTargetsDto } from './classification-targets.dto';

export class UpdateHealthProfileDto {
  @IsOptional()
  @IsEnum(HealthFramework)
  framework?: HealthFramework;

  @IsOptional()
  @IsNumberString()
  monthlyIncome?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClassificationTargetsDto)
  config?: ClassificationTargetsDto;
}
