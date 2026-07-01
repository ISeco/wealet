export class NetWorthResponseDto {
  available: string;
  reserve: string;
  committed: string;
  total: string;
  previousTotal?: string;
  changePercent?: number | null;
}
