import { TransactionType } from '../../../common/enums/transaction-type.enum';
import { TransactionSource } from '../entities/transaction.entity';

export class TransactionResponseDto {
  id: string;
  fundId: string;
  categoryId: string;
  type: TransactionType;
  amount: string;
  amountFormatted: string;
  currency: string;
  description: string | null;
  occurredOn: string;
  source: TransactionSource;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedTransactionsResponseDto {
  data: TransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
}
