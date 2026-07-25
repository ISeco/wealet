import { toTransactionResponseDto } from './transaction.mapper';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../../../common/enums/transaction-type.enum';
import { TransactionSource } from '../entities/transaction.entity';

function baseTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'tx1',
    userId: 'u1',
    fundId: 'f1',
    categoryId: 'c1',
    type: TransactionType.EXPENSE,
    amount: '9480',
    currency: 'CLP',
    description: null,
    occurredOn: '2026-07-25',
    dedupeHash: null,
    source: TransactionSource.MANUAL,
    monthlyAllocationId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    originalAmount: null,
    originalCurrency: null,
    exchangeRate: null,
    ...overrides,
  } as Transaction;
}

describe('toTransactionResponseDto', () => {
  it('expone los campos original cuando existen', () => {
    const dto = toTransactionResponseDto(
      baseTx({
        originalAmount: '999',
        originalCurrency: 'USD',
        exchangeRate: '948.95',
      }),
    );
    expect(dto.originalAmount).toBe('999');
    expect(dto.originalCurrency).toBe('USD');
    expect(dto.exchangeRate).toBe('948.95');
  });

  it('deja los campos original en null para transacciones normales', () => {
    const dto = toTransactionResponseDto(baseTx({}));
    expect(dto.originalAmount).toBeNull();
    expect(dto.originalCurrency).toBeNull();
    expect(dto.exchangeRate).toBeNull();
  });
});
