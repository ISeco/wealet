import { formatMoney } from '../../../common/money/money';
import { Fund } from '../entities/fund.entity';
import { FundResponseDto } from '../dto/fund-response.dto';

const FUND_CURRENCY = 'CLP';

export function toFundResponseDto(
  fund: Fund,
  balance: string,
): FundResponseDto {
  return {
    id: fund.id,
    name: fund.name,
    classification: fund.classification,
    color: fund.color,
    isOperative: fund.isOperative,
    countsForRunway: fund.countsForRunway,
    archivedAt: fund.archivedAt,
    balance,
    balanceFormatted: formatMoney(balance, FUND_CURRENCY),
    createdAt: fund.createdAt,
    updatedAt: fund.updatedAt,
  };
}
