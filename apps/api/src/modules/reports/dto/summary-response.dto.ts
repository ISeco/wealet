export class SummaryResponseDto {
  balance: string;
  income: string;
  expense: string;
  previousExpense?: string;
  expenseChangePercent?: number | null;
}
