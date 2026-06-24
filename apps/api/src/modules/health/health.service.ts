import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { assignDefined } from '../../common/utils/assign-defined';
import { AssessmentResponseDto } from './dto/assessment-response.dto';
import { BucketAssessmentDto } from './dto/bucket-assessment.dto';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto';
import {
  HealthFramework,
  HealthProfile,
} from './entities/health-profile.entity';
import { getFrameworkStrategy } from './strategies/framework-strategy.factory';

interface ClassificationFlowRow {
  classification: 'available' | 'reserve' | 'committed';
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
    const existing = await this.healthProfileRepository.findOne({
      where: { userId },
    });
    if (existing) {
      return existing;
    }

    const profile = this.healthProfileRepository.create({
      userId,
      framework: HealthFramework.FONDOS,
      config: getFrameworkStrategy(
        HealthFramework.FONDOS,
      ).getDefaultTargets() as unknown as Record<string, unknown>,
    });
    return this.healthProfileRepository.save(profile);
  }

  async updateProfile(
    userId: string,
    dto: UpdateHealthProfileDto,
  ): Promise<HealthProfile> {
    const profile = await this.getOrCreateProfile(userId);

    if (dto.config) {
      const { available, reserve, committed } = dto.config;
      if (available + reserve + committed !== 100) {
        throw new BadRequestException(
          'config percentages (available + reserve + committed) must sum to 100',
        );
      }
    }

    assignDefined(profile, dto);
    return this.healthProfileRepository.save(profile);
  }

  async getAssessment(
    userId: string,
    from: string,
    to: string,
  ): Promise<AssessmentResponseDto> {
    const profile = await this.getOrCreateProfile(userId);
    const targets =
      (profile.config as unknown as {
        available: number;
        reserve: number;
        committed: number;
      } | null) ?? getFrameworkStrategy(profile.framework).getDefaultTargets();

    const [{ total_income: totalIncome }]: Array<{ total_income: string }> =
      await this.dataSource.query(
        `SELECT COALESCE(SUM(amount), 0)::text AS total_income
         FROM transactions
         WHERE user_id = $1 AND type = 'income' AND occurred_on BETWEEN $2 AND $3`,
        [userId, from, to],
      );

    const rows: ClassificationFlowRow[] = await this.dataSource.query(
      `SELECT f.classification AS classification,
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
       GROUP BY f.classification`,
      [userId, from, to],
    );

    const amountByClassification = new Map(
      rows.map((row) => [row.classification, row.amount]),
    );
    const income = Number(totalIncome);
    const classifications: Array<'available' | 'reserve' | 'committed'> = [
      'available',
      'reserve',
      'committed',
    ];

    const buckets: BucketAssessmentDto[] = classifications.map(
      (classification) => {
        const actualAmount = amountByClassification.get(classification) ?? '0';
        const actualPercentage =
          income > 0
            ? Number(((Number(actualAmount) / income) * 100).toFixed(2))
            : 0;
        return {
          classification,
          targetPercentage: targets[classification],
          actualPercentage,
          actualAmount,
        };
      },
    );

    return { framework: profile.framework, totalIncome, buckets };
  }
}
