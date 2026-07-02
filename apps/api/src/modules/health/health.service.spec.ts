import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { HealthService } from './health.service';
import {
  HealthProfile,
  HealthFramework,
} from './entities/health-profile.entity';
import { Fund, FundClassification } from '../funds/entities/fund.entity';

const healthProfileInsertQb = {
  insert: jest.fn().mockReturnThis(),
  into: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  orIgnore: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({}),
};

const mockHealthProfileRepo = {
  createQueryBuilder: jest.fn(() => healthProfileInsertQb),
  findOne: jest.fn(),
  save: jest.fn(),
};

let txFundRepo: {
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
};

const mockDataSource = {
  query: jest.fn(),
  transaction: jest.fn((cb: (manager: unknown) => unknown) => {
    txFundRepo = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((data: Partial<Fund>) => data as Fund),
      save: jest.fn((funds: Fund[]) => Promise.resolve(funds)),
    };
    const manager = { getRepository: jest.fn(() => txFundRepo) };
    return cb(manager);
  }),
};

const buildFund = (overrides: Partial<Fund> = {}): Fund =>
  ({
    id: 'f1',
    userId: 'user-1',
    name: 'Necesidades',
    classification: FundClassification.COMMITTED,
    color: null,
    isOperative: false,
    countsForRunway: false,
    frameworkSlot: null,
    targetPercentage: null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Fund;

const buildProfile = (
  overrides: Partial<HealthProfile> = {},
): HealthProfile => ({
  id: 'hp-1',
  userId: 'user-1',
  framework: HealthFramework.FONDOS,
  monthlyIncome: null,
  updatedAt: new Date(),
  user: undefined as never,
  ...overrides,
});

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    healthProfileInsertQb.execute.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getRepositoryToken(HealthProfile),
          useValue: mockHealthProfileRepo,
        },
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  describe('getAssessment', () => {
    it('returns actualPercentage=0 for all funds when totalBase is 0', async () => {
      mockHealthProfileRepo.findOne.mockResolvedValue(buildProfile());
      mockDataSource.query
        .mockResolvedValueOnce([{ total_income: '0' }])
        .mockResolvedValueOnce([
          {
            fund_id: 'f1',
            fund_name: 'Operativa',
            classification: 'available',
            framework_slot: null,
            target_percentage: null,
            amount: '500000',
          },
        ]);

      const result = await service.getAssessment(
        'user-1',
        '2025-01-01',
        '2025-01-31',
      );

      expect(result.totalBase).toBe('0');
      expect(result.funds[0].actualPercentage).toBe(0);
    });

    it('calculates adherence percentage correctly', async () => {
      mockHealthProfileRepo.findOne.mockResolvedValue(buildProfile());
      mockDataSource.query
        .mockResolvedValueOnce([{ total_income: '1000000' }])
        .mockResolvedValueOnce([
          {
            fund_id: 'f1',
            fund_name: 'Necesidades',
            classification: 'available',
            framework_slot: '50_30_20:needs',
            target_percentage: 50,
            amount: '500000',
          },
        ]);

      const result = await service.getAssessment(
        'user-1',
        '2025-01-01',
        '2025-01-31',
      );

      expect(result.totalBase).toBe('1000000');
      expect(result.funds[0].actualPercentage).toBe(50);
    });

    it('uses monthlyIncome as fallback when period has no income', async () => {
      mockHealthProfileRepo.findOne.mockResolvedValue(
        buildProfile({ monthlyIncome: '2000000' }),
      );
      mockDataSource.query
        .mockResolvedValueOnce([{ total_income: '0' }])
        .mockResolvedValueOnce([
          {
            fund_id: 'f1',
            fund_name: 'Operativa',
            classification: 'available',
            framework_slot: null,
            target_percentage: null,
            amount: '1000000',
          },
        ]);

      const result = await service.getAssessment(
        'user-1',
        '2025-01-01',
        '2025-01-31',
      );

      expect(result.totalBase).toBe('2000000');
      expect(result.funds[0].actualPercentage).toBe(50);
    });
  });

  describe('updateProfile', () => {
    it('provisions framework funds when framework changes', async () => {
      const profile = buildProfile({ framework: HealthFramework.FONDOS });
      mockHealthProfileRepo.findOne.mockResolvedValue(profile);
      mockHealthProfileRepo.save.mockImplementation((p) =>
        Promise.resolve(p as HealthProfile),
      );

      await service.updateProfile('user-1', {
        framework: HealthFramework.FIFTY_THIRTY_TWENTY,
      });

      expect(mockHealthProfileRepo.save).toHaveBeenCalled();
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    });

    it('does not provision funds when framework is unchanged in the DTO', async () => {
      const profile = buildProfile({ framework: HealthFramework.FONDOS });
      mockHealthProfileRepo.findOne.mockResolvedValue(profile);
      mockHealthProfileRepo.save.mockImplementation((p) =>
        Promise.resolve(p as HealthProfile),
      );

      await service.updateProfile('user-1', { monthlyIncome: '3000000' });

      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('provisionFrameworkFunds', () => {
    it('creates the target framework funds when none exist yet', async () => {
      const result = await service.provisionFrameworkFunds(
        'user-1',
        HealthFramework.FIFTY_THIRTY_TWENTY,
      );

      expect(result).toHaveLength(3);
      expect(result.map((f) => f.frameworkSlot)).toEqual(
        expect.arrayContaining([
          '50_30_20_committed',
          '50_30_20_available',
          '50_30_20_reserve',
        ]),
      );
      // archive batch (empty here) then create/reactivate batch, as two
      // separate sequential save() calls
      expect(txFundRepo.save).toHaveBeenNthCalledWith(1, []);
      expect(txFundRepo.save).toHaveBeenNthCalledWith(
        2,
        expect.arrayContaining([
          expect.objectContaining({ frameworkSlot: '50_30_20_committed' }),
        ]),
      );
    });

    it('archives active funds belonging to a different framework', async () => {
      const orphan = buildFund({
        id: 'orphan-1',
        frameworkSlot: 'profit_first:estilo_de_vida',
        archivedAt: null,
      });
      mockDataSource.transaction.mockImplementationOnce(
        (cb: (manager: unknown) => unknown) => {
          txFundRepo = {
            find: jest.fn().mockResolvedValue([orphan]),
            create: jest.fn((data: Partial<Fund>) => data as Fund),
            save: jest.fn((funds: Fund[]) => Promise.resolve(funds)),
          };
          return cb({ getRepository: jest.fn(() => txFundRepo) });
        },
      );

      await service.provisionFrameworkFunds(
        'user-1',
        HealthFramework.FIFTY_THIRTY_TWENTY,
      );

      expect(orphan.archivedAt).toBeInstanceOf(Date);
      expect(orphan.isOperative).toBe(false);
    });

    it('reactivates an existing archived fund for the target slot instead of creating a duplicate', async () => {
      const archived = buildFund({
        id: 'existing-1',
        name: 'Mis Necesidades', // user-customized name, must be preserved
        frameworkSlot: '50_30_20_committed',
        targetPercentage: 50,
        archivedAt: new Date('2026-01-01'),
      });
      mockDataSource.transaction.mockImplementationOnce(
        (cb: (manager: unknown) => unknown) => {
          txFundRepo = {
            find: jest.fn().mockResolvedValue([archived]),
            create: jest.fn((data: Partial<Fund>) => data as Fund),
            save: jest.fn((funds: Fund[]) => Promise.resolve(funds)),
          };
          return cb({ getRepository: jest.fn(() => txFundRepo) });
        },
      );

      const result = await service.provisionFrameworkFunds(
        'user-1',
        HealthFramework.FIFTY_THIRTY_TWENTY,
      );

      const reactivated = result.find(
        (f) => f.frameworkSlot === '50_30_20_committed',
      );
      expect(reactivated).toBe(archived); // same row, not a new one
      expect(reactivated?.archivedAt).toBeNull();
      expect(reactivated?.name).toBe('Mis Necesidades'); // preserved, not reset to template
      // no duplicate created for the slot that already had a fund (the other
      // two 50/30/20 slots are legitimately created since they don't exist yet)
      expect(txFundRepo.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ frameworkSlot: '50_30_20_committed' }),
      );
    });

    it('archives all active slot funds and creates nothing for FONDOS', async () => {
      const active = buildFund({
        id: 'active-1',
        frameworkSlot: 'jars_nec',
        archivedAt: null,
      });
      mockDataSource.transaction.mockImplementationOnce(
        (cb: (manager: unknown) => unknown) => {
          txFundRepo = {
            find: jest.fn().mockResolvedValue([active]),
            create: jest.fn((data: Partial<Fund>) => data as Fund),
            save: jest.fn((funds: Fund[]) => Promise.resolve(funds)),
          };
          return cb({ getRepository: jest.fn(() => txFundRepo) });
        },
      );

      const result = await service.provisionFrameworkFunds(
        'user-1',
        HealthFramework.FONDOS,
      );

      expect(result).toHaveLength(0);
      expect(active.archivedAt).toBeInstanceOf(Date);
    });

    it('archives the outgoing fund before creating/reactivating the incoming fund with the same name (regression guard)', async () => {
      // both 50_30_20 and jars_eker have a "Necesidades" slot fund
      const outgoing = buildFund({
        id: 'outgoing-1',
        name: 'Necesidades',
        frameworkSlot: 'jars_nec',
        archivedAt: null,
      });
      mockDataSource.transaction.mockImplementationOnce(
        (cb: (manager: unknown) => unknown) => {
          txFundRepo = {
            find: jest.fn().mockResolvedValue([outgoing]),
            create: jest.fn((data: Partial<Fund>) => data as Fund),
            save: jest.fn((funds: Fund[]) => Promise.resolve(funds)),
          };
          return cb({ getRepository: jest.fn(() => txFundRepo) });
        },
      );

      await service.provisionFrameworkFunds(
        'user-1',
        HealthFramework.FIFTY_THIRTY_TWENTY,
      );

      expect(txFundRepo.save).toHaveBeenCalledTimes(2);
      const [archiveCallArgs] = txFundRepo.save.mock.calls[0];
      const [createCallArgs] = txFundRepo.save.mock.calls[1];
      expect(archiveCallArgs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 'outgoing-1' })]),
      );
      expect(createCallArgs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ frameworkSlot: '50_30_20_committed' }),
        ]),
      );
      // archive batch must be persisted strictly before the create/reactivate batch
      const archiveOrder = txFundRepo.save.mock.invocationCallOrder[0];
      const createOrder = txFundRepo.save.mock.invocationCallOrder[1];
      expect(archiveOrder).toBeLessThan(createOrder);
    });

    it('translates a unique-violation on save into a ConflictException', async () => {
      const uniqueViolationError = Object.assign(
        Object.create(QueryFailedError.prototype),
        { code: '23505', message: 'duplicate key value' },
      );
      mockDataSource.transaction.mockImplementationOnce(
        (cb: (manager: unknown) => unknown) => {
          txFundRepo = {
            find: jest.fn().mockResolvedValue([]),
            create: jest.fn((data: Partial<Fund>) => data as Fund),
            save: jest.fn().mockRejectedValue(uniqueViolationError),
          };
          return cb({ getRepository: jest.fn(() => txFundRepo) });
        },
      );

      await expect(
        service.provisionFrameworkFunds(
          'user-1',
          HealthFramework.FIFTY_THIRTY_TWENTY,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('restores isOperative from the template when reactivating an archived fund', async () => {
      // jars_ffa ("Rico") has isOperative: true in the template, but the
      // archive step force-clears isOperative on any fund it archives
      const archived = buildFund({
        id: 'existing-ffa',
        name: 'Mi Fondo Rico', // user-customized name, must still be preserved
        frameworkSlot: 'jars_ffa',
        isOperative: false,
        archivedAt: new Date('2026-01-01'),
      });
      mockDataSource.transaction.mockImplementationOnce(
        (cb: (manager: unknown) => unknown) => {
          txFundRepo = {
            find: jest.fn().mockResolvedValue([archived]),
            create: jest.fn((data: Partial<Fund>) => data as Fund),
            save: jest.fn((funds: Fund[]) => Promise.resolve(funds)),
          };
          return cb({ getRepository: jest.fn(() => txFundRepo) });
        },
      );

      const result = await service.provisionFrameworkFunds(
        'user-1',
        HealthFramework.JARS_EKER,
      );

      const reactivated = result.find((f) => f.frameworkSlot === 'jars_ffa');
      expect(reactivated).toBe(archived);
      expect(reactivated?.isOperative).toBe(true);
      expect(reactivated?.name).toBe('Mi Fondo Rico'); // still preserved
    });
  });
});
