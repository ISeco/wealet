export class TransferResponseDto {
  id: string;
  fromFundId: string;
  toFundId: string;
  amount: string;
  amountFormatted: string;
  currency: string;
  occurredOn: string;
  note: string | null;
  createdAt: Date;
}
