import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import {
  HealthProfile,
  HealthFramework,
} from './entities/health-profile.entity';
import { Fund } from '../funds/entities/fund.entity';

const healthProfileInsertQb = {
  insert: jest.fn().mockReturnThis(),
  into: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  orIgnore: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({}),
};

const fundSelectQb = {
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockHealthProfileRepo = {
  createQueryBuilder: jest.fn(() => healthProfileInsertQb),
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockFundRepo = {
  createQueryBuilder: jest.fn(() => fundSelectQb),
  create: jest.fn((entity: Partial<Fund>) => entity as Fund),
  save: jest.fn(),
};

const mockDataSource = {
  query: jest.fn(),
};

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
    fundSelectQb.getMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getRepositoryToken(HealthProfile),
          useValue: mockHealthProfileRepo,
        },
        { provide: getRepositoryToken(Fund), useValue: mockFundRepo },
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
    it('saves profile and seeds framework funds when framework changes', async () => {
      const profile = buildProfile({ framework: HealthFramework.FONDOS });
      mockHealthProfileRepo.findOne.mockResolvedValue(profile);
      mockHealthProfileRepo.save.mockImplementation((p) =>
        Promise.resolve(p as HealthProfile),
      );
      fundSelectQb.getMany.mockResolvedValue([]);

      await service.updateProfile('user-1', {
        framework: HealthFramework.FIFTY_THIRTY_TWENTY,
      });

      expect(mockHealthProfileRepo.save).toHaveBeenCalled();
      expect(mockFundRepo.save).toHaveBeenCalled();
    });

    it('does not seed funds when framework is unchanged', async () => {
      const profile = buildProfile({ framework: HealthFramework.FONDOS });
      mockHealthProfileRepo.findOne.mockResolvedValue(profile);
      mockHealthProfileRepo.save.mockImplementation((p) =>
        Promise.resolve(p as HealthProfile),
      );

      await service.updateProfile('user-1', { monthlyIncome: '3000000' });

      expect(mockFundRepo.save).not.toHaveBeenCalled();
    });
  });
});
