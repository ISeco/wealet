import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { Category } from '../categories/entities/category.entity';
import { FundsService } from '../funds/funds.service';
import { TransactionType } from '../../common/enums/transaction-type.enum';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockTransactionRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
  query: jest.fn(),
};

const mockCategoryRepo = {
  findOne: jest.fn(),
};

const mockFundsService = {
  findOneOrThrow: jest.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: FundsService, useValue: mockFundsService },
      ],
    }).compile();

    service = module.get(TransactionsService);
  });

  describe('findAll', () => {
    it('always applies userId filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-123', {});

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('userId'),
        expect.objectContaining({ userId: 'user-123' }),
      );
    });

    it('applies date range filters when provided', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-123', {
        from: '2025-01-01',
        to: '2025-01-31',
      });

      const andWhereCalls = mockQueryBuilder.andWhere.mock.calls.map(
        (c: unknown[]) => c[0] as string,
      );
      expect(andWhereCalls.some((q) => q.includes('occurredOn'))).toBe(true);
    });

    it('does not apply fundId filter when not provided', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-123', {});

      const andWhereCalls = mockQueryBuilder.andWhere.mock.calls.map(
        (c: unknown[]) => c[0] as string,
      );
      expect(andWhereCalls.some((q) => q.includes('fundId'))).toBe(false);
    });

    it('returns correct pagination metadata', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 42]);

      const result = await service.findAll('user-123', { page: 2, limit: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (page-1) * limit
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.total).toBe(42);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('applies type filter when provided', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-123', { type: TransactionType.INCOME });

      const andWhereCalls = mockQueryBuilder.andWhere.mock.calls.map(
        (c: unknown[]) => c[0] as string,
      );
      expect(andWhereCalls.some((q) => q.includes('type'))).toBe(true);
    });

    it('uses parameterized ILIKE for text search (no SQL injection)', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-123', { q: "'; DROP TABLE transactions;--" });

      const andWhereCalls = mockQueryBuilder.andWhere.mock.calls;
      const qCall = andWhereCalls.find((c: unknown[]) =>
        (c[0] as string).includes('ILIKE'),
      );
      expect(qCall).toBeDefined();
      expect((qCall as unknown[])[1]).toEqual(
        expect.objectContaining({ q: expect.stringContaining('%') }),
      );
    });
  });

  describe('create', () => {
    it('sets userId from parameter, not from DTO', async () => {
      mockFundsService.findOneOrThrow.mockResolvedValue({ id: 'f1' });
      mockCategoryRepo.findOne.mockResolvedValue({
        id: 'c1',
        userId: 'user-123',
      });
      mockTransactionRepo.create.mockReturnValue({ userId: 'user-123' });
      mockTransactionRepo.save.mockResolvedValue({
        id: 'tx-1',
        userId: 'user-123',
      });

      await service.create('user-123', {
        fundId: 'f1',
        amount: '1000',
        type: TransactionType.EXPENSE,
        occurredOn: '2025-01-01',
        categoryId: 'c1',
      });

      expect(mockTransactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-123' }),
      );
    });
  });

  describe('findOneOrThrow', () => {
    it('throws NotFoundException when transaction does not exist for this user', async () => {
      mockTransactionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOneOrThrow('user-123', 'nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns the transaction when found', async () => {
      const tx = { id: 'tx-1', userId: 'user-123' } as Transaction;
      mockTransactionRepo.findOne.mockResolvedValue(tx);

      const result = await service.findOneOrThrow('user-123', 'tx-1');

      expect(result).toBe(tx);
    });
  });

  describe('getFundMonths', () => {
    it('queries scoped by both userId and fundId', async () => {
      mockTransactionRepo.query.mockResolvedValue([]);

      await service.getFundMonths('user-123', 'fund-1');

      expect(mockTransactionRepo.query).toHaveBeenCalledWith(
        expect.stringContaining('fund_id = $2'),
        ['user-123', 'fund-1'],
      );
    });

    it('returns months from the query, most recent first', async () => {
      mockTransactionRepo.query.mockResolvedValue([
        { month: '2025-03' },
        { month: '2025-01' },
      ]);
      const currentMonth = new Date().toISOString().slice(0, 7);

      const result = await service.getFundMonths('user-123', 'fund-1');

      expect(result).toEqual([currentMonth, '2025-03', '2025-01']);
    });

    it('prepends the current month when the query does not include it', async () => {
      mockTransactionRepo.query.mockResolvedValue([{ month: '2020-03' }]);
      const currentMonth = new Date().toISOString().slice(0, 7);

      const result = await service.getFundMonths('user-123', 'fund-1');

      expect(result[0]).toBe(currentMonth);
      expect(result).toContain('2020-03');
    });

    it('does not duplicate the current month when the query already includes it', async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      mockTransactionRepo.query.mockResolvedValue([
        { month: currentMonth },
        { month: '2025-01' },
      ]);

      const result = await service.getFundMonths('user-123', 'fund-1');

      expect(result).toEqual([currentMonth, '2025-01']);
    });

    it('returns only the current month when the fund has no transactions', async () => {
      mockTransactionRepo.query.mockResolvedValue([]);
      const currentMonth = new Date().toISOString().slice(0, 7);

      const result = await service.getFundMonths('user-123', 'fund-1');

      expect(result).toEqual([currentMonth]);
    });
  });
});
