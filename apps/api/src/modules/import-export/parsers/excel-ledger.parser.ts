import { createHash } from 'crypto';
import * as XLSX from 'xlsx';
import { TransactionType } from '../../../common/enums/transaction-type.enum';

const MONTH_NAMES_ES: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const HEADER_ROW_INDEX = 1; // row 2 (0-indexed)
const OPENING_BALANCE_ROW_INDEX = 2; // row 3 (0-indexed)
const FIRST_DATA_ROW_INDEX = 3; // row 4 (0-indexed)

export interface ParsedTransactionRow {
  sheet: string;
  cell: string;
  fundName: string;
  amount: string;
  type: TransactionType;
  description: string | null;
  occurredOn: string;
  dedupeHash: string;
}

export interface ParsedOpeningBalance {
  sheet: string;
  fundName: string;
  amount: string;
}

export interface ParseError {
  sheet: string;
  cell: string;
  message: string;
}

export interface ParsedWorkbook {
  rows: ParsedTransactionRow[];
  openingBalances: ParsedOpeningBalance[];
  fundNames: string[];
  errors: ParseError[];
}

function parseSheetMonth(
  sheetName: string,
): { year: number; month: number } | null {
  const match = /^([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+(\d{4})$/.exec(sheetName.trim());
  if (!match) {
    return null;
  }
  const month = MONTH_NAMES_ES[match[1].toLowerCase()];
  if (!month) {
    return null;
  }
  return { year: Number(match[2]), month };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function computeDedupeHash(
  sheet: string,
  fundName: string,
  cell: string,
  amount: number,
): string {
  return createHash('sha256')
    .update(`${sheet}|${fundName}|${cell}|${amount}`)
    .digest('hex');
}

function getCell(
  sheet: XLSX.WorkSheet,
  address: string,
): XLSX.CellObject | undefined {
  return (sheet as Record<string, XLSX.CellObject | undefined>)[address];
}

export function parseLedgerWorkbook(buffer: Buffer): ParsedWorkbook {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const rows: ParsedTransactionRow[] = [];
  const openingBalances: ParsedOpeningBalance[] = [];
  const errors: ParseError[] = [];
  const fundNames = new Set<string>();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const ref = sheet['!ref'];
    if (!ref) {
      continue;
    }
    const period = parseSheetMonth(sheetName);
    if (!period) {
      errors.push({
        sheet: sheetName,
        cell: '',
        message: `Could not parse month/year from sheet name "${sheetName}"`,
      });
      continue;
    }

    const range = XLSX.utils.decode_range(ref);
    const totalsRowIndex = range.e.r;
    const lastDay = daysInMonth(period.year, period.month);
    // Bound by calendar days, not by footer position — tolerates a footer
    // of any number of summary rows (1, 2, or more) without needing to
    // detect "Total" labels by content.
    const lastDataRowIndex = Math.min(
      totalsRowIndex - 1,
      FIRST_DATA_ROW_INDEX + lastDay - 1,
    );

    const fundColumns: Array<{ col: number; name: string }> = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerAddress = XLSX.utils.encode_cell({
        r: HEADER_ROW_INDEX,
        c: col,
      });
      const headerCell = getCell(sheet, headerAddress);
      if (
        headerCell &&
        headerCell.t === 's' &&
        typeof headerCell.v === 'string' &&
        headerCell.v.trim()
      ) {
        const fundName = headerCell.v.trim();
        fundColumns.push({ col, name: fundName });
        fundNames.add(fundName);
      }
    }

    for (const { col, name: fundName } of fundColumns) {
      const openingAddress = XLSX.utils.encode_cell({
        r: OPENING_BALANCE_ROW_INDEX,
        c: col,
      });
      const openingCell = getCell(sheet, openingAddress);
      if (
        openingCell &&
        typeof openingCell.v === 'number' &&
        openingCell.v !== 0
      ) {
        openingBalances.push({
          sheet: sheetName,
          fundName,
          amount: String(Math.round(openingCell.v)),
        });
      }

      for (let r = FIRST_DATA_ROW_INDEX; r <= lastDataRowIndex; r++) {
        const address = XLSX.utils.encode_cell({ r, c: col });
        const cell = getCell(sheet, address);
        if (!cell || cell.v === undefined || cell.v === null || cell.v === '') {
          continue;
        }
        if (typeof cell.v !== 'number') {
          errors.push({
            sheet: sheetName,
            cell: address,
            message: `Expected a numeric amount, got "${String(cell.v)}"`,
          });
          continue;
        }
        if (cell.v === 0) {
          continue;
        }

        const amount = Math.round(cell.v);
        const dayOffset = r - FIRST_DATA_ROW_INDEX;
        const day = Math.min(dayOffset + 1, lastDay);
        const description = cell.c?.[0]?.t?.trim() ?? null;

        rows.push({
          sheet: sheetName,
          cell: address,
          fundName,
          amount: String(Math.abs(amount)),
          type: amount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
          description,
          occurredOn: toIsoDate(period.year, period.month, day),
          dedupeHash: computeDedupeHash(sheetName, fundName, address, amount),
        });
      }
    }
  }

  // Fold opening balances into rows as 'Saldo inicial' income transactions.
  // Only the earliest month per fund is used — subsequent months' opening
  // balances are already captured by the imported transaction rows.
  const earliestPerFund = new Map<
    string,
    { year: number; month: number; amount: number }
  >();
  for (const ob of openingBalances) {
    const period = parseSheetMonth(ob.sheet);
    if (!period) continue;
    const existing = earliestPerFund.get(ob.fundName);
    if (
      !existing ||
      period.year < existing.year ||
      (period.year === existing.year && period.month < existing.month)
    ) {
      earliestPerFund.set(ob.fundName, {
        ...period,
        amount: Number(ob.amount),
      });
    }
  }
  for (const [fundName, { year, month, amount }] of earliestPerFund) {
    rows.push({
      sheet: 'opening_balance',
      cell: `${fundName}|${year}-${String(month).padStart(2, '0')}`,
      fundName,
      amount: String(Math.abs(amount)),
      type: amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
      description: 'Saldo inicial',
      occurredOn: toIsoDate(year, month, 1),
      dedupeHash: computeDedupeHash(
        'opening_balance',
        fundName,
        `${year}-${String(month).padStart(2, '0')}`,
        amount,
      ),
    });
  }

  return {
    rows,
    openingBalances,
    fundNames: Array.from(fundNames),
    errors,
  };
}
