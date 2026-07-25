import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { assignDefined } from '../../common/utils/assign-defined';
import { convertToBase } from '../../common/money/money';
import { Category } from '../categories/entities/category.entity';
import { FundsService } from '../funds/funds.service';
import { UsersService } from '../users/users.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';

const DEFAULT_CURRENCY = 'CLP';

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly fundsService: FundsService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    await this.fundsService.findOneOrThrow(userId, dto.fundId);
    await this.assertCategoryAccessible(userId, dto.categoryId);

    const hasForeign =
      dto.originalAmount !== undefined ||
      dto.originalCurrency !== undefined ||
      dto.exchangeRate !== undefined;

    let amount = dto.amount;
    let currency = dto.currency ?? DEFAULT_CURRENCY;
    let originalAmount: string | null = null;
    let originalCurrency: string | null = null;
    let exchangeRate: string | null = null;

    if (hasForeign) {
      if (
        dto.originalAmount === undefined ||
        dto.originalCurrency === undefined ||
        dto.exchangeRate === undefined
      ) {
        throw new BadRequestException(
          'originalAmount, originalCurrency y exchangeRate deben enviarse juntos',
        );
      }

      const user = await this.usersService.findById(userId);
      const baseCurrency = user?.baseCurrency ?? DEFAULT_CURRENCY;

      if (dto.originalCurrency === baseCurrency) {
        throw new BadRequestException(
          'originalCurrency debe ser distinta de la moneda base',
        );
      }
      if (Number(dto.exchangeRate) <= 0) {
        throw new BadRequestException('exchangeRate debe ser mayor que 0');
      }

      currency = baseCurrency;
      amount = convertToBase(
        dto.originalAmount,
        dto.originalCurrency,
        baseCurrency,
        dto.exchangeRate,
      );
      originalAmount = dto.originalAmount;
      originalCurrency = dto.originalCurrency;
      exchangeRate = dto.exchangeRate;
    }

    const transaction = this.transactionsRepository.create({
      fundId: dto.fundId,
      categoryId: dto.categoryId,
      type: dto.type,
      description: dto.description ?? null,
      occurredOn: dto.occurredOn,
      userId,
      amount,
      currency,
      originalAmount,
      originalCurrency,
      exchangeRate,
    });
    return this.transactionsRepository.save(transaction);
  }

  async findAll(
    userId: string,
    query: TransactionQueryDto,
  ): Promise<PaginatedTransactions> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    if (query.from) {
      qb.andWhere('transaction.occurredOn >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('transaction.occurredOn <= :to', { to: query.to });
    }
    if (query.type) {
      qb.andWhere('transaction.type = :type', { type: query.type });
    }
    if (query.categoryId) {
      qb.andWhere('transaction.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.fundId) {
      qb.andWhere('transaction.fundId = :fundId', { fundId: query.fundId });
    }
    if (query.q) {
      qb.andWhere('transaction.description ILIKE :q', { q: `%${query.q}%` });
    }

    const [data, total] = await qb
      .orderBy('transaction.occurredOn', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getFundMonths(userId: string, fundId: string): Promise<string[]> {
    const rows: Array<{ month: string }> =
      await this.transactionsRepository.query(
        `SELECT DISTINCT to_char(date_trunc('month', occurred_on), 'YYYY-MM') AS month
       FROM transactions
       WHERE user_id = $1 AND fund_id = $2
       ORDER BY month DESC`,
        [userId, fundId],
      );
    const months = rows.map((r) => r.month);
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!months.includes(currentMonth)) months.unshift(currentMonth);
    return months;
  }

  async findOneOrThrow(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOneOrThrow(userId, id);

    if (dto.fundId) {
      await this.fundsService.findOneOrThrow(userId, dto.fundId);
    }
    if (dto.categoryId) {
      await this.assertCategoryAccessible(userId, dto.categoryId);
    }

    assignDefined(transaction, dto);
    return this.transactionsRepository.save(transaction);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOneOrThrow(userId, id);
    await this.transactionsRepository.delete({ id, userId });
  }

  private async assertCategoryAccessible(
    userId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });
    if (!category || (category.userId !== null && category.userId !== userId)) {
      throw new NotFoundException('Category not found');
    }
  }
}
