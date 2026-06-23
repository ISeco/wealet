import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { FundsService } from './funds.service';
import { Fund, FundClassification } from './entities/fund.entity';

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
});
