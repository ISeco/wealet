import { ImportRowDto } from './import-row.dto';

export class OpeningBalanceDto {
  sheet: string;
  fundName: string;
  amount: string;
}

export class ParseErrorDto {
  sheet: string;
  cell: string;
  message: string;
}

export class ImportPreviewResponseDto {
  rows: ImportRowDto[];
  openingBalances: OpeningBalanceDto[];
  unknownFunds: string[];
  errors: ParseErrorDto[];
}
