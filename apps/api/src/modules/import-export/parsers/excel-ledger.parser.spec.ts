import * as XLSX from 'xlsx';
import { TransactionType } from '../../../common/enums/transaction-type.enum';
import { parseLedgerWorkbook } from './excel-ledger.parser';

function buildWorkbookBuffer(): Buffer {
  const data: unknown[][] = [
    [],
    [null, null, null, null, 'Fondo Libre', 'Fondo Rico'],
    [null, null, null, null, 182362, 0],
    [null, 'Sueldo Líquido', 'Total'],
    [],
    [],
    [null, null, null, 'Total c/u', 273341, 0],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const cells = worksheet as Record<string, XLSX.CellObject>;
  const expenseComment: XLSX.CellObject['c'] = [
    { a: 'test', t: 'Giro Pasajes' },
  ];
  const incomeComment: XLSX.CellObject['c'] = [{ a: 'test', t: 'Depósito' }];
  cells['E4'] = { t: 'n', v: -10000, c: expenseComment };
  cells['F4'] = { t: 'n', v: 50000, c: incomeComment };
  cells['E5'] = { t: 'n', v: 0 };
  worksheet['!ref'] = 'A1:F7';

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enero 2026');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

function buildMonthOnlySheetBuffer(sheetName: string): Buffer {
  const data: unknown[][] = [
    [],
    [null, null, null, null, 'Fondo Test'],
    [null, null, null, null, 0],
    [null, null, null, null, -500],
    [null, null, null, null, 0],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet['!ref'] = 'A1:E5';
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

describe('parseLedgerWorkbook', () => {
  it('parses fund columns, comments, opening balances, and skips totals', () => {
    const result = parseLedgerWorkbook(buildWorkbookBuffer());

    expect(result.errors).toEqual([]);
    expect(result.fundNames).toEqual(['Fondo Libre', 'Fondo Rico']);

    expect(result.openingBalances).toEqual([
      { sheet: 'Enero 2026', fundName: 'Fondo Libre', amount: '182362' },
    ]);

    expect(result.rows).toHaveLength(3);

    const opening = result.rows.find((row) => row.sheet === 'opening_balance')!;
    expect(opening.fundName).toBe('Fondo Libre');
    expect(opening.amount).toBe('182362');
    expect(opening.type).toBe(TransactionType.INCOME);
    expect(opening.description).toBe('Saldo inicial');
    expect(opening.occurredOn).toBe('2026-01-01');

    const expense = result.rows.find((row) => row.cell === 'E4')!;
    expect(expense.type).toBe(TransactionType.EXPENSE);
    expect(expense.amount).toBe('10000');
    expect(expense.fundName).toBe('Fondo Libre');
    expect(expense.description).toBe('Giro Pasajes');
    expect(expense.occurredOn).toBe('2026-01-01');

    const income = result.rows.find((row) => row.cell === 'F4')!;
    expect(income.type).toBe(TransactionType.INCOME);
    expect(income.amount).toBe('50000');
    expect(income.description).toBe('Depósito');

    // row 5 has value 0, must not produce a transaction; totals row (row 7) is excluded entirely
    expect(result.rows.some((row) => row.cell.endsWith('5'))).toBe(false);
    expect(result.rows.some((row) => row.cell.endsWith('7'))).toBe(false);
  });

  it('produces a stable dedupeHash for the same cell across re-imports', () => {
    const first = parseLedgerWorkbook(buildWorkbookBuffer());
    const second = parseLedgerWorkbook(buildWorkbookBuffer());

    expect(first.rows[0].dedupeHash).toBe(second.rows[0].dedupeHash);
  });

  it('silently skips a sheet whose name has no recognizable month', () => {
    const data: unknown[][] = [
      [],
      [null, 'Fondo Libre'],
      [null, 0],
      [null, 10000],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!ref'] = 'A1:B4';
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invalid Sheet Name');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    const result = parseLedgerWorkbook(buffer);

    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(0);
    expect(result.needsYear).toBe(false);
  });

  it('flags needsYear when a sheet has a month but no year in its name', () => {
    const buffer = buildMonthOnlySheetBuffer('Plantilla Enero');

    const result = parseLedgerWorkbook(buffer);

    expect(result.needsYear).toBe(true);
    expect(result.rows).toEqual([]);
  });

  it('uses the provided year for sheets whose name has a month but no year', () => {
    const buffer = buildMonthOnlySheetBuffer('Plantilla Enero');

    const result = parseLedgerWorkbook(buffer, { year: 2026 });

    expect(result.needsYear).toBe(false);
    const expense = result.rows.find((row) => row.cell === 'E4')!;
    expect(expense.occurredOn).toBe('2026-01-01');
  });

  it('recognizes a month name embedded in a longer sheet name', () => {
    const buffer = buildMonthOnlySheetBuffer('Plantilla Enero 2026');

    const result = parseLedgerWorkbook(buffer);

    expect(result.needsYear).toBe(false);
    const expense = result.rows.find((row) => row.cell === 'E4')!;
    expect(expense.occurredOn).toBe('2026-01-01');
  });

  it('records an error for a non-numeric cell value', () => {
    const data: unknown[][] = [
      [],
      [null, null, null, null, 'Fondo Libre'],
      [null, null, null, null, 0],
      [null, null, null, null, 'texto-no-numerico'],
      [],
      [null, null, null, null, 0],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!ref'] = 'A1:E6';
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Febrero 2026');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    const result = parseLedgerWorkbook(buffer);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('Expected a numeric amount');
  });

  it('excludes a multi-row totals footer bounded by the days in the month', () => {
    const zeroRows: unknown[][] = Array.from({ length: 30 }, () => [
      null,
      null,
      null,
      null,
      0,
    ]);
    const data: unknown[][] = [
      [],
      [null, null, null, null, 'Fondo Test'],
      [null, null, null, null, 1000],
      [null, null, null, null, -500],
      ...zeroRows,
      [null, null, null, 'Total c/u', 99999],
      [null, null, null, 'Total en la cuenta', 99999],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!ref'] = 'A1:E36';
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enero 2026');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    const result = parseLedgerWorkbook(buffer);

    expect(result.rows.some((row) => row.amount === '99999')).toBe(false);
    expect(result.rows).toHaveLength(2); // day-1 expense + opening balance
  });

  it('excludes the "Total c/u" row when it immediately follows the last real movement (no blank buffer row)', () => {
    // Reproduces the real-world case: a 30-day month (Abril) whose sheet
    // only has 3 rows of actual movements, with "Total c/u" landing right
    // after them — no blank rows in between. The calendar-day bound alone
    // would let the parser read past the real data and into the totals
    // row, treating the fund's running total as a new income transaction.
    const data: unknown[][] = [
      [],
      [null, null, null, null, 'Fondo Test'],
      [null, null, null, null, 0],
      [null, null, null, null, -500],
      [null, null, null, null, 0],
      [null, null, null, null, 300],
      [null, null, null, 'Total c/u', 99999],
      [null, null, null, 'Total en la cuenta', 99999],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!ref'] = 'A1:E8';
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Abril 2026');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    const result = parseLedgerWorkbook(buffer);

    expect(result.rows.some((row) => row.amount === '99999')).toBe(false);
    expect(result.rows).toHaveLength(2); // day-2 expense + day-4 income
  });

  it('injects the monthly income delta between a month\'s opening balance and the previous month\'s "Total c/u"', () => {
    const enero: unknown[][] = [
      [],
      [null, null, null, null, 'Fondo Test'],
      [null, null, null, null, 1000],
      [null, null, null, null, -200],
      [null, null, null, 'Total c/u', 800],
      [null, null, null, 'Total en la cuenta', 800],
    ];
    const febrero: unknown[][] = [
      [],
      [null, null, null, null, 'Fondo Test'],
      [null, null, null, null, 900], // 800 (Enero's Total c/u) + 100 new
      [null, null, null, null, -50],
      [null, null, null, 'Total c/u', 850],
      [null, null, null, 'Total en la cuenta', 850],
    ];
    const workbook = XLSX.utils.book_new();
    const enSheet = XLSX.utils.aoa_to_sheet(enero);
    enSheet['!ref'] = 'A1:E6';
    XLSX.utils.book_append_sheet(workbook, enSheet, 'Enero 2026');
    const febSheet = XLSX.utils.aoa_to_sheet(febrero);
    febSheet['!ref'] = 'A1:E6';
    XLSX.utils.book_append_sheet(workbook, febSheet, 'Febrero 2026');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    const result = parseLedgerWorkbook(buffer);

    const injection = result.rows.find(
      (row) => row.description === 'Ingreso mensual asignado',
    )!;
    expect(injection).toBeDefined();
    expect(injection.fundName).toBe('Fondo Test');
    expect(injection.amount).toBe('100');
    expect(injection.type).toBe(TransactionType.INCOME);
    expect(injection.occurredOn).toBe('2026-02-01');

    // Enero (earliest month) gets no injection row — it's the anchor via "Saldo inicial".
    expect(
      result.rows.filter(
        (row) => row.description === 'Ingreso mensual asignado',
      ),
    ).toHaveLength(1);
  });

  it('captures a real movement placed beyond the calendar-day count, before the "Total c/u" footer', () => {
    // Reproduces a real case: the user added an extra row for a second
    // same-day transaction, pushing it past the calendar-day bound
    // (Marzo has 31 days, so row index 34 would be "day 32"). The old
    // logic capped reads at `FIRST_DATA_ROW_INDEX + lastDay - 1` even
    // when the real "Total c/u" footer (found by label) was further
    // down, silently dropping this row instead of trusting the label.
    const data: unknown[][] = Array.from({ length: 37 }, () => []);
    data[1] = [null, null, null, null, 'Fondo Libre'];
    data[2] = [null, null, null, null, 0];
    data[3] = [null, null, null, null, -500];
    data[34] = [null, null, null, null, 324719]; // row 35: "day 32", beyond March's 31 days
    data[36] = [null, null, null, 'Total c/u', 99999];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!ref'] = 'A1:E37';
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marzo 2026');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    const result = parseLedgerWorkbook(buffer);

    const extraRow = result.rows.find((row) => row.amount === '324719');
    expect(extraRow).toBeDefined();
    expect(extraRow!.type).toBe(TransactionType.INCOME);
    expect(extraRow!.occurredOn).toBe('2026-03-31'); // clamped to the month's last real day
    expect(result.rows.some((row) => row.amount === '99999')).toBe(false);
  });

  it('does not fabricate a "Saldo inicial" when a fund\'s first real month opens at exactly 0', () => {
    // A fund created with no starting money (fila 3 = 0 in its first sheet)
    // was being excluded from opening-balance detection (which only kept
    // non-zero values), so the *next* month's opening balance — which is
    // really just that month's carried-over total, not new money — got
    // wrongly treated as the "Saldo inicial" anchor and double-counted.
    const enero: unknown[][] = [
      [],
      [null, null, null, null, 'Fondo Test'],
      [null, null, null, null, 0],
      [null, null, null, null, -100],
      [null, null, null, 'Total c/u', -100],
      [null, null, null, 'Total en la cuenta', -100],
    ];
    const febrero: unknown[][] = [
      [],
      [null, null, null, null, 'Fondo Test'],
      [null, null, null, null, -100], // just Enero's carried-over total, no new money
      [null, null, null, null, 50],
      [null, null, null, 'Total c/u', -50],
      [null, null, null, 'Total en la cuenta', -50],
    ];
    const workbook = XLSX.utils.book_new();
    const enSheet = XLSX.utils.aoa_to_sheet(enero);
    enSheet['!ref'] = 'A1:E6';
    XLSX.utils.book_append_sheet(workbook, enSheet, 'Enero 2026');
    const febSheet = XLSX.utils.aoa_to_sheet(febrero);
    febSheet['!ref'] = 'A1:E6';
    XLSX.utils.book_append_sheet(workbook, febSheet, 'Febrero 2026');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    const result = parseLedgerWorkbook(buffer);

    expect(result.rows.some((row) => row.description === 'Saldo inicial')).toBe(
      false,
    );
    expect(
      result.rows.some((row) => row.description === 'Ingreso mensual asignado'),
    ).toBe(false);
    expect(result.rows).toHaveLength(2); // Enero -100 expense + Febrero 50 income

    const total = result.rows.reduce(
      (sum, row) =>
        sum +
        (row.type === TransactionType.INCOME ? 1 : -1) * Number(row.amount),
      0,
    );
    expect(total).toBe(-50); // matches Febrero's real "Total c/u"
  });

  it('rounds a "Saldo inicial" opening balance with a floating-point cell value to an integer', () => {
    // Excel formulas can leave a fund's opening cell as e.g. 92878.1 due to
    // float rounding drift. Unlike the preview-only `openingBalances` list
    // (which rounds via Math.round at capture time), the "Saldo inicial" row
    // built from `openingByFundMonth` used the raw unrounded value, producing
    // a non-integer amount string that Postgres' bigint column rejects.
    const data: unknown[][] = [
      [],
      [null, null, null, null, 'Fondo Libre'],
      [null, null, null, null, 92878.1],
      [null, null, null, null, -500],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!ref'] = 'A1:E4';
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enero 2026');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    const result = parseLedgerWorkbook(buffer);

    const opening = result.rows.find((row) => row.sheet === 'opening_balance')!;
    expect(opening.amount).toBe('92878');
    expect(Number.isInteger(Number(opening.amount))).toBe(true);
  });
});
