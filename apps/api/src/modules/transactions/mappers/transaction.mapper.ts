import { formatMoney } from '../../../common/money/money';
import { Transaction } from '../entities/transaction.entity';
import { TransactionResponseDto } from '../dto/transaction-response.dto';

export function toTransactionResponseDto(
  transaction: Transaction,
): TransactionResponseDto {
  return {
    id: transaction.id,
    fundId: transaction.fundId,
    categoryId: transaction.categoryId,
    type: transaction.type,
    amount: transaction.amount,
    amountFormatted: formatMoney(transaction.amount, transaction.currency),
    currency: transaction.currency,
    description: transaction.description,
    occurredOn: transaction.occurredOn,
    source: transaction.source,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}
