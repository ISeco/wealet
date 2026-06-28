import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { assignDefined } from '../../common/utils/assign-defined';
import { Fund } from '../funds/entities/fund.entity';
import { AssessmentResponseDto } from './dto/assessment-response.dto';
import { FundAssessmentDto } from './dto/bucket-assessment.dto';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto';
import {
  HealthFramework,
  HealthProfile,
} from './entities/health-profile.entity';
import {
  FRAMEWORK_FUND_TEMPLATES,
  frameworkSlotPrefix,
} from './framework-funds';

interface FundFlowRow {
  fund_id: string;
  fund_name: string;
  classification: 'available' | 'reserve' | 'committed';
  framework_slot: string | null;
  target_percentage: number | null;
  amount: string;
}

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthProfile)
    private readonly healthProfileRepository: Repository<HealthProfile>,
    @InjectRepository(Fund)
    private readonly fundsRepository: Repository<Fund>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getOrCreateProfile(userId: string): Promise<HealthProfile> {
    await this.healthProfileRepository
      .createQueryBuilder()
      .insert()
      .into(HealthProfile)
      .values({ userId, framework: HealthFramework.FONDOS })
      .orIgnore()
      .execute();

    return this.healthProfileRepository.findOne({
      where: { userId },
    }) as Promise<HealthProfile>;
  }

  async updateProfile(
    userId: string,
    dto: UpdateHealthProfileDto,
  ): Promise<HealthProfile> {
    const profile = await this.getOrCreateProfile(userId);
    assignDefined(profile, dto);
    const saved = await this.healthProfileRepository.save(profile);

    if (dto.framework) {
      await this.seedFrameworkFunds(userId, dto.framework);
    }

    return saved;
  }

  async getAssessment(
    userId: string,
    from: string,
    to: string,
  ): Promise<AssessmentResponseDto> {
    const profile = await this.getOrCreateProfile(userId);

    if (profile.framework === HealthFramework.FONDOS) {
      return this.getFondosAssessment(userId, profile.framework);
    }
    return this.getFlowAssessment(userId, profile.framework, from, to);
  }

  private async getFondosAssessment(
    userId: string,
    framework: HealthFramework,
  ): Promise<AssessmentResponseDto> {
    const rows: FundFlowRow[] = await this.dataSource.query(
      `SELECT f.id AS fund_id, f.name AS fund_name,
              f.classification, f.framework_slot, f.target_percentage,
              COALESCE(SUM(m.amount), 0)::text AS amount
       FROM funds f
       LEFT JOIN (
         SELECT fund_id,
           CASE WHEN type = 'income' THEN amount ELSE -amount END AS amount
         FROM transactions WHERE user_id = $1
         UNION ALL
         SELECT to_fund_id AS fund_id, amount FROM transfers WHERE user_id = $1
         UNION ALL
         SELECT from_fund_id AS fund_id, -amount FROM transfers WHERE user_id = $1
       ) m ON m.fund_id = f.id
       WHERE f.user_id = $1
         AND f.archived_at IS NULL
         AND f.framework_slot IS NULL
       GROUP BY f.id, f.name, f.classification, f.framework_slot, f.target_percentage
       ORDER BY f.created_at ASC`,
      [userId],
    );

    const totalBalance = rows.reduce((sum, r) => sum + Number(r.amount), 0);
    const funds: FundAssessmentDto[] = rows.map((row) => {
      const actualAmount = row.amount;
      const actualPercentage =
        totalBalance > 0
          ? Number(((Number(actualAmount) / totalBalance) * 100).toFixed(2))
          : 0;
      return {
        fundId: row.fund_id,
        fundName: row.fund_name,
        classification: row.classification,
        frameworkSlot: row.framework_slot,
        targetPercentage: row.target_percentage ?? 0,
        actualPercentage,
        actualAmount,
      };
    });

    return { framework, totalBase: totalBalance.toString(), funds };
  }

  private async getFlowAssessment(
    userId: string,
    framework: HealthFramework,
    from: string,
    to: string,
  ): Promise<AssessmentResponseDto> {
    const [{ total_income: totalIncome }]: Array<{ total_income: string }> =
      await this.dataSource.query(
        `SELECT COALESCE(SUM(amount), 0)::text AS total_income
         FROM transactions
         WHERE user_id = $1 AND type = 'income' AND occurred_on BETWEEN $2 AND $3`,
        [userId, from, to],
      );

    const rows: FundFlowRow[] = await this.dataSource.query(
      `SELECT f.id AS fund_id, f.name AS fund_name,
              f.classification, f.framework_slot, f.target_percentage,
              COALESCE(SUM(m.amount), 0)::text AS amount
       FROM funds f
       LEFT JOIN (
         SELECT fund_id,
           CASE WHEN type = 'income' THEN amount ELSE -amount END AS amount,
           occurred_on
         FROM transactions WHERE user_id = $1
         UNION ALL
         SELECT to_fund_id AS fund_id, amount, occurred_on
         FROM transfers WHERE user_id = $1
         UNION ALL
         SELECT from_fund_id AS fund_id, -amount, occurred_on
         FROM transfers WHERE user_id = $1
       ) m ON m.fund_id = f.id AND m.occurred_on BETWEEN $2 AND $3
       WHERE f.user_id = $1
         AND f.archived_at IS NULL
         AND ${this.fundSlotFilter(framework)}
       GROUP BY f.id, f.name, f.classification, f.framework_slot, f.target_percentage
       ORDER BY f.created_at ASC`,
      [userId, from, to],
    );

    const income = Number(totalIncome);
    const funds: FundAssessmentDto[] = rows.map((row) => {
      const actualAmount = row.amount;
      const actualPercentage =
        income > 0
          ? Number(((Number(actualAmount) / income) * 100).toFixed(2))
          : 0;
      return {
        fundId: row.fund_id,
        fundName: row.fund_name,
        classification: row.classification,
        frameworkSlot: row.framework_slot,
        targetPercentage: row.target_percentage ?? 0,
        actualPercentage,
        actualAmount,
      };
    });

    return { framework, totalBase: totalIncome, funds };
  }

  private fundSlotFilter(framework: HealthFramework): string {
    if (framework === HealthFramework.FONDOS) {
      return 'f.framework_slot IS NULL';
    }
    const prefix = frameworkSlotPrefix(framework);
    return `f.framework_slot LIKE '${prefix}%'`;
  }

  private async seedFrameworkFunds(
    userId: string,
    framework: HealthFramework,
  ): Promise<void> {
    const templates = FRAMEWORK_FUND_TEMPLATES[framework];
    if (templates.length === 0) return;

    const existingSlots = await this.fundsRepository
      .createQueryBuilder('f')
      .select('f.frameworkSlot')
      .where('f.userId = :userId', { userId })
      .andWhere('f.frameworkSlot IS NOT NULL')
      .getMany()
      .then((funds) => new Set(funds.map((f) => f.frameworkSlot)));

    const toCreate = templates.filter((t) => !existingSlots.has(t.slot));
    if (toCreate.length === 0) return;

    const funds = toCreate.map((t) =>
      this.fundsRepository.create({
        userId,
        name: t.name,
        classification: t.classification,
        frameworkSlot: t.slot,
        targetPercentage: t.targetPercentage,
        isOperative: false,
        countsForRunway: false,
      }),
    );
    await this.fundsRepository.save(funds);
  }
}
