import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
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
      await this.provisionFrameworkFunds(userId, dto.framework);
    }

    return saved;
  }

  async getAssessment(
    userId: string,
    from: string,
    to: string,
  ): Promise<AssessmentResponseDto> {
    const profile = await this.getOrCreateProfile(userId);
    return this.getFlowAssessment(userId, profile, from, to);
  }

  private async getFlowAssessment(
    userId: string,
    profile: HealthProfile,
    from: string,
    to: string,
  ): Promise<AssessmentResponseDto> {
    const framework = profile.framework;

    const [{ total_income: totalIncome }]: Array<{ total_income: string }> =
      await this.dataSource.query(
        `SELECT COALESCE(SUM(amount), 0)::text AS total_income
         FROM transactions
         WHERE user_id = $1 AND type = 'income' AND occurred_on BETWEEN $2 AND $3`,
        [userId, from, to],
      );

    const effectiveIncome =
      Number(totalIncome) === 0 && profile.monthlyIncome
        ? profile.monthlyIncome
        : totalIncome;

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
       ) m ON m.fund_id = f.id AND m.occurred_on BETWEEN $2 AND $3
       WHERE f.user_id = $1
         AND f.archived_at IS NULL
         AND ${this.fundSlotFilter(framework)}
       GROUP BY f.id, f.name, f.classification, f.framework_slot, f.target_percentage
       ORDER BY f.created_at ASC`,
      [userId, from, to],
    );

    const income = Number(effectiveIncome);
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

    return { framework, totalBase: effectiveIncome, funds };
  }

  private fundSlotFilter(framework: HealthFramework): string {
    if (framework === HealthFramework.FONDOS) {
      return 'f.framework_slot IS NULL';
    }
    const prefix = frameworkSlotPrefix(framework);
    return `f.framework_slot LIKE '${prefix}%'`;
  }

  async provisionFrameworkFunds(
    userId: string,
    framework: HealthFramework,
  ): Promise<Fund[]> {
    return this.dataSource.transaction(async (manager) => {
      const fundsRepo = manager.getRepository(Fund);
      const prefix = frameworkSlotPrefix(framework);

      const slotFunds = await fundsRepo.find({
        where: { userId, frameworkSlot: Not(IsNull()) },
      });

      const toArchive = slotFunds.filter(
        (f) =>
          f.archivedAt === null &&
          (framework === HealthFramework.FONDOS ||
            !f.frameworkSlot!.startsWith(prefix)),
      );
      toArchive.forEach((fund) => {
        fund.archivedAt = new Date();
        fund.isOperative = false;
      });

      const bySlot = new Map(slotFunds.map((f) => [f.frameworkSlot, f]));
      const result: Fund[] = FRAMEWORK_FUND_TEMPLATES[framework].map(
        (template) => {
          const existing = bySlot.get(template.slot);
          if (existing) {
            existing.archivedAt = null;
            return existing;
          }
          return fundsRepo.create({
            userId,
            name: template.name,
            classification: template.classification,
            frameworkSlot: template.slot,
            targetPercentage: template.targetPercentage,
            isOperative: template.isOperative,
            countsForRunway: template.countsForRunway,
          });
        },
      );

      await fundsRepo.save([...toArchive, ...result]);
      return result;
    });
  }
}
