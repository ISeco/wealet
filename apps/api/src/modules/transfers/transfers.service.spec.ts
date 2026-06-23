import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { TransfersService } from './transfers.service';
import { Transfer } from './entities/transfer.entity';
import { Fund, FundClassification } from '../funds/entities/fund.entity';

describe('TransfersService', () => {
  let transfersService: TransfersService;
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

  const baseDto = {
    fromFundId: 'fund-1',
    toFundId: 'fund-2',
    amount: '5000',
    occurredOn: '2026-06-01',
  };

  let manager: {
    getRepository: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let fundsRepositoryInTransaction: { findOne: jest.Mock };

  beforeEach(async () => {
    fundsRepositoryInTransaction = { findOne: jest.fn() };
    manager = {
      getRepository: jest.fn().mockReturnValue(fundsRepositoryInTransaction),
      create: jest.fn((_entity, plain) => plain),
      save: jest.fn((entity) =>
        Promise.resolve({ id: 'transfer-1', ...entity }),
      ),
    };

    const module = await Test.createTestingModule({
      providers: [
        TransfersService,
        {
          provide: getRepositoryToken(Transfer),
          useValue: {
            createQueryBuilder: jest.fn(),
          } as Partial<Repository<Transfer>>,
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            transaction: jest.fn((cb: (manager: unknown) => unknown) =>
              Promise.resolve(cb(manager)),
            ),
          },
        },
      ],
    }).compile();

    transfersService = module.get(TransfersService);
    dataSource = module.get(getDataSourceToken());
  });

  it('rejects a transfer between the same fund before touching the database', async () => {
    await expect(
      transfersService.create('user-1', {
        ...baseDto,
        toFundId: baseDto.fromFundId,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('rejects a zero amount before touching the database', async () => {
    await expect(
      transfersService.create('user-1', { ...baseDto, amount: '0' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('rejects when the source fund is not owned by the user', async () => {
    fundsRepositoryInTransaction.findOne.mockResolvedValue(null);

    await expect(
      transfersService.create('user-1', baseDto),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates the transfer in a single transaction when both funds are owned', async () => {
    fundsRepositoryInTransaction.findOne
      .mockResolvedValueOnce(buildFund({ id: 'fund-1' }))
      .mockResolvedValueOnce(buildFund({ id: 'fund-2' }));

    const result = await transfersService.create('user-1', baseDto);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      fromFundId: 'fund-1',
      toFundId: 'fund-2',
      amount: '5000',
      currency: 'CLP',
      userId: 'user-1',
    });
  });
});
