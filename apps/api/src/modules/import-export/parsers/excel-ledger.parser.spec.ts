import { Workbook, type Worksheet } from 'exceljs';
import { TransactionType } from '../../../common/enums/transaction-type.enum';
import { parseLedgerWorkbook } from './excel-ledger.parser';

// Mirrors the row/col shape of the old xlsx-based fixtures: `data[r][c]`
// is 0-indexed, matching the parser's own row-index constants, and mapped
// here to exceljs's 1-indexed `getCell`. Null/undefined entries are left
// unset, matching aoa_to_sheet's sparse-cell behavior.
function aoaToWorksheet(
  workbook: Workbook,
  sheetName: string,
  data: unknown[][],
): Worksheet {
  const worksheet = workbook.addWorksheet(sheetName);
  data.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value === null || value === undefined) return;
      worksheet.getCell(r + 1, c + 1).value = value as string | number;
    });
  });
  return worksheet;
}

async function buildWorkbookBuffer(): Promise<Buffer> {
  const data: unknown[][] = [
    [],
    [null, null, null, null, 'Fondo Libre', 'Fondo Rico'],
    [null, null, null, null, 182362, 0],
    [null, 'Sueldo Líquido', 'Total'],
    [],
    [],
    [null, null, null, 'Total c/u', 273341, 0],
  ];
  const workbook = new Workbook();
  const worksheet = aoaToWorksheet(workbook, 'Enero 2026', data);
  worksheet.getCell('E4').value = -10000;
  worksheet.getCell('E4').note = 'Giro Pasajes';
  worksheet.getCell('F4').value = 50000;
  worksheet.getCell('F4').note = 'Depósito';
  worksheet.getCell('E5').value = 0;
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function buildMonthOnlySheetBuffer(sheetName: string): Promise<Buffer> {
  const data: unknown[][] = [
    [],
    [null, null, null, null, 'Fondo Test'],
    [null, null, null, null, 0],
    [null, null, null, null, -500],
    [null, null, null, null, 0],
  ];
  const workbook = new Workbook();
  aoaToWorksheet(workbook, sheetName, data);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

describe('parseLedgerWorkbook', () => {
  it('parses fund columns, comments, opening balances, and skips totals', async () => {
    const result = await parseLedgerWorkbook(await buildWorkbookBuffer());

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

  it('produces a stable dedupeHash for the same cell across re-imports', async () => {
    const buffer = await buildWorkbookBuffer();
    const first = await parseLedgerWorkbook(buffer);
    const second = await parseLedgerWorkbook(buffer);

    expect(first.rows[0].dedupeHash).toBe(second.rows[0].dedupeHash);
  });

  it('silently skips a sheet whose name has no recognizable month', async () => {
    const data: unknown[][] = [
      [],
      [null, 'Fondo Libre'],
      [null, 0],
      [null, 10000],
    ];
    const workbook = new Workbook();
    aoaToWorksheet(workbook, 'Invalid Sheet Name', data);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await parseLedgerWorkbook(buffer);

    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(0);
    expect(result.needsYear).toBe(false);
  });

  it('flags needsYear when a sheet has a month but no year in its name', async () => {
    const buffer = await buildMonthOnlySheetBuffer('Plantilla Enero');

    const result = await parseLedgerWorkbook(buffer);

    expect(result.needsYear).toBe(true);
    expect(result.rows).toEqual([]);
  });

  it('uses the provided year for sheets whose name has a month but no year', async () => {
    const buffer = await buildMonthOnlySheetBuffer('Plantilla Enero');

    const result = await parseLedgerWorkbook(buffer, { year: 2026 });

    expect(result.needsYear).toBe(false);
    const expense = result.rows.find((row) => row.cell === 'E4')!;
    expect(expense.occurredOn).toBe('2026-01-01');
  });

  it('recognizes a month name embedded in a longer sheet name', async () => {
    const buffer = await buildMonthOnlySheetBuffer('Plantilla Enero 2026');

    const result = await parseLedgerWorkbook(buffer);

    expect(result.needsYear).toBe(false);
    const expense = result.rows.find((row) => row.cell === 'E4')!;
    expect(expense.occurredOn).toBe('2026-01-01');
  });

  it('records an error for a non-numeric cell value', async () => {
    const data: unknown[][] = [
      [],
      [null, null, null, null, 'Fondo Libre'],
      [null, null, null, null, 0],
      [null, null, null, null, 'texto-no-numerico'],
      [],
      [null, null, null, null, 0],
    ];
    const workbook = new Workbook();
    aoaToWorksheet(workbook, 'Febrero 2026', data);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await parseLedgerWorkbook(buffer);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('Expected a numeric amount');
  });

  it('excludes a multi-row totals footer bounded by the days in the month', async () => {
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
    const workbook = new Workbook();
    aoaToWorksheet(workbook, 'Enero 2026', data);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await parseLedgerWorkbook(buffer);

    expect(result.rows.some((row) => row.amount === '99999')).toBe(false);
    expect(result.rows).toHaveLength(2); // day-1 expense + opening balance
  });

  it('excludes the "Total c/u" row when it immediately follows the last real movement (no blank buffer row)', async () => {
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
    const workbook = new Workbook();
    aoaToWorksheet(workbook, 'Abril 2026', data);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await parseLedgerWorkbook(buffer);

    expect(result.rows.some((row) => row.amount === '99999')).toBe(false);
    expect(result.rows).toHaveLength(2); // day-2 expense + day-4 income
  });

  it('injects the monthly income delta between a month\'s opening balance and the previous month\'s "Total c/u"', async () => {
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
    const workbook = new Workbook();
    aoaToWorksheet(workbook, 'Enero 2026', enero);
    aoaToWorksheet(workbook, 'Febrero 2026', febrero);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await parseLedgerWorkbook(buffer);

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

  it('captures a real movement placed beyond the calendar-day count, before the "Total c/u" footer', async () => {
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
    const workbook = new Workbook();
    aoaToWorksheet(workbook, 'Marzo 2026', data);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await parseLedgerWorkbook(buffer);

    const extraRow = result.rows.find((row) => row.amount === '324719');
    expect(extraRow).toBeDefined();
    expect(extraRow!.type).toBe(TransactionType.INCOME);
    expect(extraRow!.occurredOn).toBe('2026-03-31'); // clamped to the month's last real day
    expect(result.rows.some((row) => row.amount === '99999')).toBe(false);
  });

  it('does not fabricate a "Saldo inicial" when a fund\'s first real month opens at exactly 0', async () => {
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
    const workbook = new Workbook();
    aoaToWorksheet(workbook, 'Enero 2026', enero);
    aoaToWorksheet(workbook, 'Febrero 2026', febrero);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await parseLedgerWorkbook(buffer);

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

  it('rounds a "Saldo inicial" opening balance with a floating-point cell value to an integer', async () => {
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
    const workbook = new Workbook();
    aoaToWorksheet(workbook, 'Enero 2026', data);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await parseLedgerWorkbook(buffer);

    const opening = result.rows.find((row) => row.sheet === 'opening_balance')!;
    expect(opening.amount).toBe('92878');
    expect(Number.isInteger(Number(opening.amount))).toBe(true);
  });
});
