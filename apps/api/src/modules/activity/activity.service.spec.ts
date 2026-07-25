import { getDataSourceToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  let service: ActivityService;
  const rows = [
    {
      type: 'transaction',
      id: 'tx1',
      amount: '9480',
      currency: 'CLP',
      occurred_on: '2026-07-25',
      description: 'Servicio USD',
      subtype: 'expense',
      fund_id: 'f1',
      category_id: 'c1',
      from_fund_id: null,
      to_fund_id: null,
      source: 'manual',
      created_at: new Date(),
      updated_at: null,
      original_amount: '999',
      original_currency: 'USD',
      exchange_rate: '948.950000',
    },
  ];
  const mockDataSource = {
    query: jest
      .fn()
      .mockResolvedValueOnce(rows)
      .mockResolvedValueOnce([{ total: '1' }]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();
    service = module.get(ActivityService);
  });

  it('mapea los campos de moneda extranjera en items de transacción', async () => {
    const result = await service.findAll('user-1', {});
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        originalAmount: '999',
        originalCurrency: 'USD',
        exchangeRate: '948.950000',
      }),
    );
  });
});
