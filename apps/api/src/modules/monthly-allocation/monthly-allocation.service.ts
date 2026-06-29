import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import { Category } from '../categories/entities/category.entity';
import { Fund } from '../funds/entities/fund.entity';
import { HealthProfile } from '../health/entities/health-profile.entity';
import {
  Transaction,
  TransactionSource,
} from '../transactions/entities/transaction.entity';
import { AllocationResponseDto } from './dto/allocation-response.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { MonthlyAllocation } from './entities/monthly-allocation.entity';

@Injectable()
export class MonthlyAllocationService {
  private allocationCategoryId: string | null = null;

  constructor(
    @InjectRepository(MonthlyAllocation)
    private readonly allocationRepo: Repository<MonthlyAllocation>,
    @InjectRepository(Fund)
    private readonly fundsRepo: Repository<Fund>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(HealthProfile)
    private readonly healthProfileRepo: Repository<HealthProfile>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private currentMonth(): string {
    return new Date().toISOString().slice(0, 7);
  }

  async getCurrent(userId: string): Promise<AllocationResponseDto | null> {
    const month = this.currentMonth();
    const allocation = await this.allocationRepo.findOne({
      where: { userId, month },
    });
    if (!allocation) return null;

    const transactions = await this.transactionRepo.find({
      where: { monthlyAllocationId: allocation.id },
      relations: { fund: true },
    });

    return {
      id: allocation.id,
      month: allocation.month,
      totalAmount: allocation.totalAmount,
      distributions: transactions.map((t) => ({
        fundId: t.fundId,
        fundName: (t as Transaction & { fund: Fund }).fund.name,
        amount: t.amount,
      })),
    };
  }

  async upsert(
    userId: string,
    dto: CreateAllocationDto,
  ): Promise<AllocationResponseDto> {
    if (BigInt(dto.totalAmount) <= 0n) {
      throw new UnprocessableEntityException(
        'El ingreso total debe ser mayor a cero',
      );
    }

    const sum = dto.distributions.reduce(
      (acc, d) => acc + BigInt(d.amount),
      0n,
    );
    if (sum !== BigInt(dto.totalAmount)) {
      throw new UnprocessableEntityException(
        'La suma de los montos debe ser igual al ingreso total',
      );
    }

    const fundIds = dto.distributions.map((d) => d.fundId);
    const ownedFunds = await this.fundsRepo.find({
      where: { id: In(fundIds), userId },
    });
    if (ownedFunds.length !== fundIds.length) {
      throw new ForbiddenException(
        'Uno o más fondos no pertenecen a este usuario',
      );
    }
    const fundMap = new Map(ownedFunds.map((f) => [f.id, f]));

    return this.dataSource.transaction(async (manager) => {
      const allocationRepo = manager.getRepository(MonthlyAllocation);
      const transactionRepo = manager.getRepository(Transaction);
      const healthProfileRepo = manager.getRepository(HealthProfile);

      const month = this.currentMonth();
      let allocation = await allocationRepo.findOne({
        where: { userId, month },
      });

      if (allocation) {
        await transactionRepo.delete({ monthlyAllocationId: allocation.id });
        allocation.totalAmount = dto.totalAmount;
        allocation = await allocationRepo.save(allocation);
      } else {
        allocation = await allocationRepo.save(
          allocationRepo.create({
            userId,
            month,
            totalAmount: dto.totalAmount,
          }),
        );
      }

      const categoryId = await this.getOrCreateAllocationCategory(manager);
      const occurredOn = `${month}-01`;

      const transactions = dto.distributions.map((d) =>
        transactionRepo.create({
          userId,
          fundId: d.fundId,
          categoryId,
          type: TransactionType.INCOME,
          amount: d.amount,
          occurredOn,
          source: TransactionSource.MANUAL,
          monthlyAllocationId: allocation.id,
          description: `Distribución ${month}`,
        }),
      );
      await transactionRepo.save(transactions);

      await healthProfileRepo
        .createQueryBuilder()
        .update()
        .set({ monthlyIncome: dto.totalAmount })
        .where('userId = :userId', { userId })
        .execute();

      return {
        id: allocation.id,
        month: allocation.month,
        totalAmount: allocation.totalAmount,
        distributions: dto.distributions.map((d) => ({
          fundId: d.fundId,
          fundName: fundMap.get(d.fundId)!.name,
          amount: d.amount,
        })),
      };
    });
  }

  private async getOrCreateAllocationCategory(
    manager: EntityManager,
  ): Promise<string> {
    if (this.allocationCategoryId) return this.allocationCategoryId;

    const repo = manager.getRepository(Category);
    let cat = await repo.findOne({
      where: {
        name: 'Distribución mensual',
        type: TransactionType.INCOME,
        userId: IsNull(),
      },
    });
    if (!cat) {
      cat = await repo.save(
        repo.create({
          name: 'Distribución mensual',
          type: TransactionType.INCOME,
          userId: null,
          isSystem: true,
        }),
      );
    }
    this.allocationCategoryId = cat.id;
    return cat.id;
  }
}
