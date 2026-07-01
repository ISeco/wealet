import { IsEnum, IsNumberString, IsOptional } from 'class-validator';
import { HealthFramework } from '../entities/health-profile.entity';

export class UpdateHealthProfileDto {
  @IsOptional()
  @IsEnum(HealthFramework)
  framework?: HealthFramework;

  @IsOptional()
  @IsNumberString()
  monthlyIncome?: string;
}
