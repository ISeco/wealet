import { NotFoundException } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { FundsService } from './funds.service';
import { Fund, FundClassification } from './entities/fund.entity';
import { FundPresetType } from './enums/fund-preset.enum';

describe('FundsService', () => {
  let fundsService: FundsService;
  let fundsRepository: jest.Mocked<Repository<Fund>>;
  let dataSource: jest.Mocked<DataSource>;

  const buildFund = (overrides: Partial<Fund> = {}): Fund =>
    ({
      id: 'fund-1',
      userId: 'user-1',
      name: 'Operativa',
      classification: FundClassification.AVAILABLE,
      color: null,
      isOperative: true,
      countsForRunway: false,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as Fund;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FundsService,
        {
          provide: getRepositoryToken(Fund),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn((entity) => entity),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            query: jest.fn(),
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    fundsService = module.get(FundsService);
    fundsRepository = module.get(getRepositoryToken(Fund));
    dataSource = module.get(getDataSourceToken());
  });

  describe('findAllWithBalances', () => {
    it('returns an empty array without querying balances when the user has no funds', async () => {
      fundsRepository.find.mockResolvedValue([]);

      const result = await fundsService.findAllWithBalances('user-1');

      expect(result).toEqual([]);
      expect(dataSource.query).not.toHaveBeenCalled();
    });

    it('joins fund metadata with the single aggregated balance query', async () => {
      const fundWithMovements = buildFund({ id: 'fund-1' });
      const fundWithoutMovements = buildFund({ id: 'fund-2', name: 'Reserva' });
      fundsRepository.find.mockResolvedValue([
        fundWithMovements,
        fundWithoutMovements,
      ]);
      dataSource.query.mockResolvedValue([
        { fund_id: 'fund-1', balance: '15000' },
      ]);

      const result = await fundsService.findAllWithBalances('user-1');

      expect(dataSource.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        { fund: fundWithMovements, balance: '15000' },
        { fund: fundWithoutMovements, balance: '0' },
      ]);
    });
  });

  describe('getBalanceForFund', () => {
    it('calculates derived balance: income - expense + incoming - outgoing', async () => {
      // income: 100000, expense: 30000, incoming: 20000, outgoing: 10000 → 80000
      dataSource.query.mockResolvedValue([{ balance: '80000' }]);

      const result = await fundsService.getBalanceForFund('user-1', 'fund-1');

      expect(result).toBe('80000');
    });

    it('returns 0 for a fund with no movements', async () => {
      dataSource.query.mockResolvedValue([{ balance: '0' }]);

      const result = await fundsService.getBalanceForFund('user-1', 'fund-1');

      expect(result).toBe('0');
    });
  });

  describe('remove', () => {
    it('archives the fund by setting archivedAt and isOperative=false', async () => {
      const fund = buildFund({ archivedAt: null, isOperative: true });
      fundsRepository.findOne.mockResolvedValue(fund);
      fundsRepository.save.mockImplementation((f) =>
        Promise.resolve(f as Fund),
      );
      dataSource.query.mockResolvedValue([{ fund_id: 'fund-1', balance: '0' }]);

      const result = await fundsService.remove('user-1', 'fund-1');

      expect(result.fund.archivedAt).toBeInstanceOf(Date);
      expect(result.fund.isOperative).toBe(false);
      expect(fundsRepository.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when fund does not belong to the user', async () => {
      fundsRepository.findOne.mockResolvedValue(null);

      await expect(
        fundsService.remove('user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPreset', () => {
    it('creates all preset funds inside a single transaction', async () => {
      const createdFunds = [buildFund({ name: 'Necesidades' })];
      type TransactionCallback = (manager: {
        create: jest.Mock;
        save: jest.Mock;
      }) => Promise<unknown>;
      (dataSource.transaction as jest.Mock).mockImplementation(
        (cb: TransactionCallback) => {
          const manager = {
            create: jest.fn((_entity: unknown, data: unknown) => data),
            save: jest.fn().mockResolvedValue(createdFunds),
          };
          return cb(manager);
        },
      );

      const result = await fundsService.createPreset('user-1', {
        preset: FundPresetType.RULE_50_30_20,
      });

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result).toEqual(createdFunds);
    });
  });
});
