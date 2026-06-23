import { formatMoney } from '../../../common/money/money';
import { Transfer } from '../entities/transfer.entity';
import { TransferResponseDto } from '../dto/transfer-response.dto';

export function toTransferResponseDto(transfer: Transfer): TransferResponseDto {
  return {
    id: transfer.id,
    fromFundId: transfer.fromFundId,
    toFundId: transfer.toFundId,
    amount: transfer.amount,
    amountFormatted: formatMoney(transfer.amount, transfer.currency),
    currency: transfer.currency,
    occurredOn: transfer.occurredOn,
    note: transfer.note,
    createdAt: transfer.createdAt,
  };
}
