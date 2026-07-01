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

  it('records an error for a sheet whose name cannot be parsed as a month', () => {
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

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].sheet).toBe('Invalid Sheet Name');
    expect(result.rows).toHaveLength(0);
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
});
