import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { UserTheme } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: UserTheme;

  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;
}
