import { FundClassification } from '../entities/fund.entity';

export class FundResponseDto {
  id: string;
  name: string;
  classification: FundClassification;
  color: string | null;
  isOperative: boolean;
  countsForRunway: boolean;
  frameworkSlot: string | null;
  targetPercentage: number | null;
  archivedAt: Date | null;
  balance: string;
  balanceFormatted: string;
  createdAt: Date;
  updatedAt: Date;
}
