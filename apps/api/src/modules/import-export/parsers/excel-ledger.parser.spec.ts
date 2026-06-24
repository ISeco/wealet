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

    expect(result.rows).toHaveLength(2);

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
});
