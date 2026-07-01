import { TransactionType } from '../../../common/enums/transaction-type.enum';

export class CategoryResponseDto {
  id: string;
  name: string;
  type: TransactionType;
  color: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}
