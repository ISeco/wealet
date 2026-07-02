import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, QueryFailedError, Repository } from 'typeorm';
import { assignDefined } from '../../common/utils/assign-defined';
import { HealthFramework } from '../health/entities/health-profile.entity';
import { HealthService } from '../health/health.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { CreatePresetFundsDto } from './dto/create-preset-funds.dto';
import { FundHistoryPointDto } from './dto/fund-history-point.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { Fund } from './entities/fund.entity';
import { FundPresetType } from './enums/fund-preset.enum';

const UNIQUE_VIOLATION = '23505';

const PRESET_TO_FRAMEWORK: Record<FundPresetType, HealthFramework> = {
  [FundPresetType.JARS_EKER]: HealthFramework.JARS_EKER,
  [FundPresetType.RULE_50_30_20]: HealthFramework.FIFTY_THIRTY_TWENTY,
  [FundPresetType.PROFIT_FIRST]: HealthFramework.PROFIT_FIRST,
};

export interface FundWithBalance {
  fund: Fund;
  balance: string;
}

interface FundBalanceRow {
  fund_id: string;
  balance: string;
}

@Injectable()
export class FundsService {
  constructor(
    @InjectRepository(Fund)
    private readonly fundsRepository: Repository<Fund>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly healthService: HealthService,
  ) {}

  async findAllWithBalances(
    userId: string,
    includeArchived = false,
  ): Promise<FundWithBalance[]> {
    const funds = await this.fundsRepository.find({
      where: includeArchived ? { userId } : { userId, archivedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });

    if (funds.length === 0) {
      return [];
    }

    const balanceByFundId = await this.getBalancesByFundId(userId);
    return funds.map((fund) => ({
      fund,
      balance: balanceByFundId.get(fund.id) ?? '0',
    }));
  }

  async create(userId: string, dto: CreateFundDto): Promise<FundWithBalance> {
    const fund = this.fundsRepository.create({
      ...dto,
      userId,
      isOperative: true,
    });
    const saved = await this.save(fund);
    return { fund: saved, balance: '0' };
  }

  async findOneOrThrow(userId: string, id: string): Promise<Fund> {
    const fund = await this.fundsRepository.findOne({
      where: { id, userId },
    });
    if (!fund) {
      throw new NotFoundException('Fund not found');
    }
    return fund;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateFundDto,
  ): Promise<FundWithBalance> {
    const fund = await this.findOneOrThrow(userId, id);
    assignDefined(fund, dto);
    const saved = await this.save(fund);
    const balance =
      (await this.getBalancesByFundId(userId)).get(saved.id) ?? '0';
    return { fund: saved, balance };
  }

  async remove(userId: string, id: string): Promise<FundWithBalance> {
    const fund = await this.findOneOrThrow(userId, id);
    fund.archivedAt = new Date();
    fund.isOperative = false;
    const saved = await this.save(fund);
    const balance =
      (await this.getBalancesByFundId(userId)).get(saved.id) ?? '0';
    return { fund: saved, balance };
  }

  async getBalanceForFund(userId: string, fundId: string): Promise<string> {
    const rows: Array<{ balance: string }> = await this.dataSource.query(
      `SELECT COALESCE(SUM(m.amount), 0)::text AS balance
       FROM (
         SELECT CASE WHEN type = 'income' THEN amount ELSE -amount END AS amount
         FROM transactions WHERE user_id = $1 AND fund_id = $2
         UNION ALL
         SELECT amount FROM transfers WHERE user_id = $1 AND to_fund_id = $2
         UNION ALL
         SELECT -amount FROM transfers WHERE user_id = $1 AND from_fund_id = $2
       ) m`,
      [userId, fundId],
    );
    return rows[0].balance;
  }

  async getHistory(
    userId: string,
    fundId: string,
    months: number,
  ): Promise<FundHistoryPointDto[]> {
    const rows: FundHistoryPointDto[] = await this.dataSource.query(
      `WITH movements AS (
         SELECT occurred_on,
           CASE WHEN type = 'income' THEN amount ELSE -amount END AS amount
         FROM transactions WHERE user_id = $1 AND fund_id = $2
         UNION ALL
         SELECT occurred_on, amount FROM transfers
         WHERE user_id = $1 AND to_fund_id = $2
         UNION ALL
         SELECT occurred_on, -amount FROM transfers
         WHERE user_id = $1 AND from_fund_id = $2
       ),
       monthly_net AS (
         SELECT date_trunc('month', occurred_on) AS month, SUM(amount) AS net
         FROM movements
         GROUP BY 1
       ),
       window_months AS (
         SELECT generate_series(
           date_trunc('month', CURRENT_DATE) - ($3::int - 1) * INTERVAL '1 month',
           date_trunc('month', CURRENT_DATE),
           INTERVAL '1 month'
         ) AS month
       ),
       prior_balance AS (
         SELECT COALESCE(SUM(net), 0) AS balance
         FROM monthly_net
         WHERE month < (SELECT MIN(month) FROM window_months)
       )
       SELECT
         to_char(w.month, 'YYYY-MM-DD') AS month,
         (
           (SELECT balance FROM prior_balance)
           + SUM(COALESCE(mn.net, 0)) OVER (ORDER BY w.month)
         )::text AS balance
       FROM window_months w
       LEFT JOIN monthly_net mn ON mn.month = w.month
       ORDER BY w.month`,
      [userId, fundId, months],
    );
    return rows;
  }

  async createPreset(
    userId: string,
    dto: CreatePresetFundsDto,
  ): Promise<Fund[]> {
    const framework = PRESET_TO_FRAMEWORK[dto.preset];
    return this.healthService.provisionFrameworkFunds(userId, framework);
  }

  private async save(fund: Fund): Promise<Fund> {
    try {
      return await this.fundsRepository.save(fund);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { code?: string }).code ===
          UNIQUE_VIOLATION
      ) {
        throw new ConflictException('A fund with this name already exists');
      }
      throw error;
    }
  }

  private async getBalancesByFundId(
    userId: string,
  ): Promise<Map<string, string>> {
    const rows: FundBalanceRow[] = await this.dataSource.query(
      `SELECT f.id AS fund_id, COALESCE(SUM(m.amount), 0)::text AS balance
       FROM funds f
       LEFT JOIN (
         SELECT fund_id, CASE WHEN type = 'income' THEN amount ELSE -amount END AS amount
         FROM transactions WHERE user_id = $1
         UNION ALL
         SELECT to_fund_id AS fund_id, amount FROM transfers WHERE user_id = $1
         UNION ALL
         SELECT from_fund_id AS fund_id, -amount FROM transfers WHERE user_id = $1
       ) m ON m.fund_id = f.id
       WHERE f.user_id = $1
       GROUP BY f.id`,
      [userId],
    );
    return new Map(rows.map((row) => [row.fund_id, row.balance]));
  }
}
