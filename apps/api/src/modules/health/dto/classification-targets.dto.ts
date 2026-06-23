import { IsInt, Max, Min } from 'class-validator';

export class ClassificationTargetsDto {
  @IsInt()
  @Min(0)
  @Max(100)
  available: number;

  @IsInt()
  @Min(0)
  @Max(100)
  reserve: number;

  @IsInt()
  @Min(0)
  @Max(100)
  committed: number;
}
