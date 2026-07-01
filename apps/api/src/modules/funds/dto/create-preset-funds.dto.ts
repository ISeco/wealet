import { IsEnum } from 'class-validator';
import { FundPresetType } from '../enums/fund-preset.enum';

export class CreatePresetFundsDto {
  @IsEnum(FundPresetType)
  preset: FundPresetType;
}
