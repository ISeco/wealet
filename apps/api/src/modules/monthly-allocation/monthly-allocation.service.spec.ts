import {
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { MonthlyAllocationService } from './monthly-allocation.service';
import { MonthlyAllocation } from './entities/monthly-allocation.entity';
import { Fund, FundClassification } from '../funds/entities/fund.entity';
import { Category } from '../categories/entities/category.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { HealthProfile } from '../health/entities/health-profile.entity';

describe('MonthlyAllocationService', () => {
  let service: MonthlyAllocationService;
  let fundsRepo: jest.Mocked<Repository<Fund>>;
  let dataSource: jest.Mocked<DataSource>;

  const buildFund = (overrides: Partial<Fund> = {}): Fund =>
    ({
      id: 'fund-1',
      userId: 'user-1',
      name: 'Necesidades',
      classification: FundClassification.COMMITTED,
      color: null,
      isOperative: false,
      countsForRunway: false,
      frameworkSlot: '50_30_20_committed',
      targetPercentage: 50,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as Fund;

  let manager: {
    getRepository: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    query: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  let allocationRepoInTx: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let transactionRepoInTx: {
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let categoryRepoInTx: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let healthProfileRepoInTx: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    allocationRepoInTx = {
      findOne: jest.fn(),
      create: jest.fn((v) => v),
      save: jest.fn((v) => Promise.resolve({ id: 'alloc-1', ...v })),
    };
    transactionRepoInTx = {
      create: jest.fn((v) => v),
      save: jest.fn((entities) => Promise.resolve(entities)),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    categoryRepoInTx = {
      findOne: jest.fn().mockResolvedValue({ id: 'cat-1' }),
      create: jest.fn((v) => v),
      save: jest.fn((v) => Promise.resolve({ id: 'cat-1', ...v })),
    };
    const mockQb = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };
    healthProfileRepoInTx = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
    };
    manager = {
      getRepository: jest.fn((entity) => {
        if (entity === MonthlyAllocation) return allocationRepoInTx;
        if (entity === Transaction) return transactionRepoInTx;
        if (entity === Category) return categoryRepoInTx;
        if (entity === HealthProfile) return healthProfileRepoInTx;
        return {};
      }),
      create: jest.fn((entity, plain) => plain),
      save: jest.fn((entity) => Promise.resolve(entity)),
      delete: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        MonthlyAllocationService,
        {
          provide: getRepositoryToken(MonthlyAllocation),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Fund),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {},
        },
        {
          provide: getRepositoryToken(HealthProfile),
          useValue: {},
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            transaction: jest.fn((cb: (m: unknown) => unknown) =>
              Promise.resolve(cb(manager)),
            ),
          },
        },
      ],
    }).compile();

    service = module.get(MonthlyAllocationService);
    fundsRepo = module.get(getRepositoryToken(Fund));
    dataSource = module.get(getDataSourceToken());
  });

  describe('upsert', () => {
    const twoFunds = [
      buildFund({ id: 'fund-1', name: 'Necesidades', targetPercentage: 50 }),
      buildFund({ id: 'fund-2', name: 'Deseos', targetPercentage: 30 }),
    ];

    it('throws UnprocessableEntityException when distribution amounts do not sum to totalAmount', async () => {
      fundsRepo.find.mockResolvedValue(twoFunds);

      await expect(
        service.upsert('user-1', {
          totalAmount: '1000000',
          distributions: [
            { fundId: 'fund-1', amount: '600000' },
            { fundId: 'fund-2', amount: '300000' },
          ],
        }),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when a fundId does not belong to the user', async () => {
      fundsRepo.find.mockResolvedValue([twoFunds[0]]);

      await expect(
        service.upsert('user-1', {
          totalAmount: '1000000',
          distributions: [
            { fundId: 'fund-1', amount: '500000' },
            { fundId: 'fund-99', amount: '500000' },
          ],
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('creates a new allocation and N transactions when none exists for the month', async () => {
      fundsRepo.find.mockResolvedValue(twoFunds);
      allocationRepoInTx.findOne.mockResolvedValue(null);

      const result = await service.upsert('user-1', {
        totalAmount: '1000000',
        distributions: [
          { fundId: 'fund-1', amount: '500000' },
          { fundId: 'fund-2', amount: '500000' },
        ],
      });

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(transactionRepoInTx.delete).not.toHaveBeenCalled();
      expect(transactionRepoInTx.save).toHaveBeenCalledTimes(1);
      expect(result.distributions).toHaveLength(2);
      expect(result.totalAmount).toBe('1000000');
    });

    it('deletes previous distribution transactions before recreating on re-upsert', async () => {
      fundsRepo.find.mockResolvedValue(twoFunds);
      allocationRepoInTx.findOne.mockResolvedValue({
        id: 'alloc-existing',
        userId: 'user-1',
        month: '2026-06',
        totalAmount: '800000',
      });
      allocationRepoInTx.save.mockResolvedValue({
        id: 'alloc-existing',
        userId: 'user-1',
        month: '2026-06',
        totalAmount: '1000000',
      });

      await service.upsert('user-1', {
        totalAmount: '1000000',
        distributions: [
          { fundId: 'fund-1', amount: '500000' },
          { fundId: 'fund-2', amount: '500000' },
        ],
      });

      expect(transactionRepoInTx.delete).toHaveBeenCalledWith({
        monthlyAllocationId: 'alloc-existing',
      });
      expect(transactionRepoInTx.save).toHaveBeenCalledTimes(1);
    });
  });
});
