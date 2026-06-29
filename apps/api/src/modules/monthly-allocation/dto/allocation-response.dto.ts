export class AllocationDistributionDto {
  fundId: string;
  fundName: string;
  amount: string;
}

export class AllocationResponseDto {
  id: string;
  month: string;
  totalAmount: string;
  distributions: AllocationDistributionDto[];
}
