import { createHash } from 'crypto';
import { Workbook } from 'exceljs';
import type { Cell, Worksheet } from 'exceljs';
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
  needsYear: boolean;
}

interface Range {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

const MONTH_PATTERN = new RegExp(
  `\\b(${Object.keys(MONTH_NAMES_ES).join('|')})\\b`,
  'i',
);
const YEAR_PATTERN = /\b(\d{4})\b/;

function parseSheetMonth(
  sheetName: string,
): { month: number; year: number | null } | null {
  const monthMatch = MONTH_PATTERN.exec(sheetName);
  if (!monthMatch) {
    return null;
  }
  const month = MONTH_NAMES_ES[monthMatch[1].toLowerCase()];
  const yearMatch = YEAR_PATTERN.exec(sheetName);
  return { month, year: yearMatch ? Number(yearMatch[1]) : null };
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

// exceljs cells are 1-indexed and auto-vivify (getCell never returns
// undefined), unlike the sparse 0-indexed object the xlsx library exposed.
function getCell(sheet: Worksheet, row0: number, col0: number): Cell {
  return sheet.getCell(row0 + 1, col0 + 1);
}

function getSheetRange(sheet: Worksheet): Range | null {
  if (sheet.rowCount === 0) {
    return null;
  }
  const dim = sheet.dimensions;
  return {
    s: { r: dim.top - 1, c: dim.left - 1 },
    e: { r: dim.bottom - 1, c: dim.right - 1 },
  };
}

// `cell.value` can be a rich-text/formula/hyperlink/error object, not just a
// primitive — default `String()` stringification would print "[object Object]".
function describeCellValue(value: Cell['value']): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// A cell comment (SheetJS: `cell.c`) is exposed by exceljs as `cell.note`,
// either a plain string or a rich-text Comment object.
function getCommentText(cell: Cell): string | null {
  const note = cell.note;
  if (!note) {
    return null;
  }
  if (typeof note === 'string') {
    return note.trim() || null;
  }
  const text = note.texts
    ?.map((t) => t.text)
    .join('')
    .trim();
  return text || null;
}

const TOTALS_PER_FUND_LABEL_PATTERN = /^total\s*c\/u$/i;

// Finds the "Total c/u" per-fund summary row by its label text rather than
// assuming a blank buffer row separates it from the last real movement.
// Sheets that are trimmed tightly (no padding to the full calendar length)
// would otherwise let the calendar-day bound read straight into this row
// and misparse the fund's running total as a new transaction.
function findTotalsPerFundRowIndex(
  sheet: Worksheet,
  range: Range,
): number | null {
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = getCell(sheet, r, c);
      if (
        typeof cell.value === 'string' &&
        TOTALS_PER_FUND_LABEL_PATTERN.test(cell.value.trim())
      ) {
        return r;
      }
    }
  }
  return null;
}

export async function parseLedgerWorkbook(
  buffer: Buffer,
  options?: { year?: number },
): Promise<ParsedWorkbook> {
  const workbook = new Workbook();
  // exceljs's bundled types predate @types/node's generic `Buffer<T>` —
  // the runtime accepts a Node Buffer fine, only the structural type check fails.
  await workbook.xlsx.load(buffer as never);

  const sheetNames = workbook.worksheets.map((ws) => ws.name);

  const needsYear = sheetNames.some((sheetName) => {
    const match = parseSheetMonth(sheetName);
    return match !== null && match.year === null;
  });
  if (needsYear && options?.year === undefined) {
    return {
      rows: [],
      openingBalances: [],
      fundNames: [],
      errors: [],
      needsYear: true,
    };
  }

  const rows: ParsedTransactionRow[] = [];
  const openingBalances: ParsedOpeningBalance[] = [];
  const errors: ParseError[] = [];
  const fundNames = new Set<string>();
  // fund -> "YYYY-MM" -> value, for every sheet the fund appears in
  // (unlike `openingBalances`, which only keeps non-zero entries for the
  // preview API). Used below to compute each month's income injection.
  const openingByFundMonth = new Map<string, Map<string, number>>();
  const totalsByFundMonth = new Map<string, Map<string, number>>();

  for (const sheet of workbook.worksheets) {
    const sheetName = sheet.name;
    const range = getSheetRange(sheet);
    if (!range) {
      continue;
    }
    const monthMatch = parseSheetMonth(sheetName);
    if (!monthMatch) {
      continue; // not a recognized monthly data sheet — skip silently
    }
    const year = monthMatch.year ?? options?.year;
    if (year === undefined) {
      continue; // unreachable: the needsYear guard above already covers this
    }
    const month = monthMatch.month;

    const totalsRowIndex = range.e.r;
    const totalsPerFundRowIndex = findTotalsPerFundRowIndex(sheet, range);
    const lastDay = daysInMonth(year, month);
    // Bound by the "Total c/u" row, found by label text rather than by
    // calendar-day count: sheets sometimes have an extra row past the
    // month's real day count (e.g. two same-day transactions split across
    // rows), and the label is ground truth for where real data ends. The
    // calendar-day cap is only a fallback for sheets with no "Total c/u"
    // label to anchor on.
    const lastDataRowIndex =
      totalsPerFundRowIndex !== null
        ? totalsPerFundRowIndex - 1
        : Math.min(totalsRowIndex - 1, FIRST_DATA_ROW_INDEX + lastDay - 1);

    const fundColumns: Array<{ col: number; name: string }> = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = getCell(sheet, HEADER_ROW_INDEX, col);
      if (typeof headerCell.value === 'string' && headerCell.value.trim()) {
        const fundName = headerCell.value.trim();
        fundColumns.push({ col, name: fundName });
        fundNames.add(fundName);
      }
    }

    for (const { col, name: fundName } of fundColumns) {
      const openingCell = getCell(sheet, OPENING_BALANCE_ROW_INDEX, col);
      if (typeof openingCell.value === 'number') {
        if (openingCell.value !== 0) {
          openingBalances.push({
            sheet: sheetName,
            fundName,
            amount: String(Math.round(openingCell.value)),
          });
        }
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        if (!openingByFundMonth.has(fundName)) {
          openingByFundMonth.set(fundName, new Map());
        }
        openingByFundMonth.get(fundName)!.set(monthKey, openingCell.value);
      }

      if (totalsPerFundRowIndex !== null) {
        const totalCell = getCell(sheet, totalsPerFundRowIndex, col);
        if (typeof totalCell.value === 'number') {
          const monthKey = `${year}-${String(month).padStart(2, '0')}`;
          if (!totalsByFundMonth.has(fundName)) {
            totalsByFundMonth.set(fundName, new Map());
          }
          totalsByFundMonth.get(fundName)!.set(monthKey, totalCell.value);
        }
      }

      for (let r = FIRST_DATA_ROW_INDEX; r <= lastDataRowIndex; r++) {
        const cell = getCell(sheet, r, col);
        if (
          cell.value === undefined ||
          cell.value === null ||
          cell.value === ''
        ) {
          continue;
        }
        if (typeof cell.value !== 'number') {
          errors.push({
            sheet: sheetName,
            cell: cell.address,
            message: `Expected a numeric amount, got "${describeCellValue(cell.value)}"`,
          });
          continue;
        }
        if (cell.value === 0) {
          continue;
        }

        const amount = Math.round(cell.value);
        const dayOffset = r - FIRST_DATA_ROW_INDEX;
        const day = Math.min(dayOffset + 1, lastDay);
        const description = getCommentText(cell);

        rows.push({
          sheet: sheetName,
          cell: cell.address,
          fundName,
          amount: String(Math.abs(amount)),
          type: amount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
          description,
          occurredOn: toIsoDate(year, month, day),
          dedupeHash: computeDedupeHash(
            sheetName,
            fundName,
            cell.address,
            amount,
          ),
        });
      }
    }
  }

  // Fold opening balances into rows as 'Saldo inicial' income transactions.
  // Only the earliest month per fund is used — subsequent months' opening
  // balances are already captured by the imported transaction rows. Sourced
  // from `openingByFundMonth` (not the zero-filtered `openingBalances`) so a
  // fund whose first real month opens at exactly 0 is still recognized as
  // its own anchor, instead of letting the next month's opening balance —
  // which is really just that month's carried-over total — be mistaken for
  // one and double-counted.
  const earliestPerFund = new Map<
    string,
    { year: number; month: number; amount: number }
  >();
  for (const [fundName, monthMap] of openingByFundMonth) {
    const earliestMonthKey = Array.from(monthMap.keys()).sort()[0];
    const [yearStr, monthStr] = earliestMonthKey.split('-');
    earliestPerFund.set(fundName, {
      year: Number(yearStr),
      month: Number(monthStr),
      amount: monthMap.get(earliestMonthKey)!,
    });
  }
  for (const [fundName, { year, month, amount }] of earliestPerFund) {
    if (amount === 0) {
      continue; // fund genuinely started at 0 — no transaction needed
    }
    const roundedAmount = Math.round(amount);
    rows.push({
      sheet: 'opening_balance',
      cell: `${fundName}|${year}-${String(month).padStart(2, '0')}`,
      fundName,
      amount: String(Math.abs(roundedAmount)),
      type:
        roundedAmount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
      description: 'Saldo inicial',
      occurredOn: toIsoDate(year, month, 1),
      dedupeHash: computeDedupeHash(
        'opening_balance',
        fundName,
        `${year}-${String(month).padStart(2, '0')}`,
        roundedAmount,
      ),
    });
  }

  // Inject the delta between each month's opening balance and the previous
  // month's "Total c/u" as a transaction. The sheet's fila 3 only records
  // (leftover from the prior month + that month's newly allocated income);
  // the leftover half is already reflected by the imported transactions,
  // so only the delta is new money. The fund's first appearance is the
  // anchor (already covered by the "Saldo inicial" row above) and is
  // skipped here.
  for (const [fundName, monthMap] of openingByFundMonth) {
    const sortedMonthKeys = Array.from(monthMap.keys()).sort();
    for (let i = 1; i < sortedMonthKeys.length; i++) {
      const monthKey = sortedMonthKeys[i];
      const previousMonthKey = sortedMonthKeys[i - 1];
      const previousTotal = totalsByFundMonth
        .get(fundName)
        ?.get(previousMonthKey);
      if (previousTotal === undefined) {
        continue; // no "Total c/u" captured for the prior month — can't compute a delta
      }
      const delta = Math.round(monthMap.get(monthKey)! - previousTotal);
      if (delta === 0) {
        continue;
      }
      const [yearStr, monthStr] = monthKey.split('-');
      const year = Number(yearStr);
      const month = Number(monthStr);
      rows.push({
        sheet: 'monthly_injection',
        cell: `${fundName}|${monthKey}`,
        fundName,
        amount: String(Math.abs(delta)),
        type: delta >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
        description: 'Ingreso mensual asignado',
        occurredOn: toIsoDate(year, month, 1),
        dedupeHash: computeDedupeHash(
          'monthly_injection',
          fundName,
          monthKey,
          delta,
        ),
      });
    }
  }

  return {
    rows,
    openingBalances,
    fundNames: Array.from(fundNames),
    errors,
    needsYear: false,
  };
}
