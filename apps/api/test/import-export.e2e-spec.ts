import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Workbook } from 'exceljs';
import { AppModule } from '../src/app.module';

const GLOBAL_PREFIX = 'api/v1';
const SHEET_NAME = 'Marzo 2026';
const FUND_NAME = 'Fondo E2E Test';

// Mirrors the row/col shape the parser expects: `data[r][c]` is 0-indexed,
// mapped here to exceljs's 1-indexed `getCell`.
function aoaToWorksheet(
  workbook: Workbook,
  sheetName: string,
  data: unknown[][],
) {
  const worksheet = workbook.addWorksheet(sheetName);
  data.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value === null || value === undefined) return;
      worksheet.getCell(r + 1, c + 1).value = value as string | number;
    });
  });
  return worksheet;
}

async function buildLedgerBuffer(): Promise<Buffer> {
  const data: unknown[][] = [
    [],
    [null, null, null, null, FUND_NAME],
    [null, null, null, null, 0],
    [null, 'Sueldo Líquido', 'Total'],
    [],
    [null, null, null, 'Total c/u', 0],
  ];
  const workbook = new Workbook();
  const worksheet = aoaToWorksheet(workbook, SHEET_NAME, data);
  worksheet.getCell('E4').value = -5000;
  worksheet.getCell('E4').note = 'Compra E2E';
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function bufferParser(res: any, callback: (err: null, body: Buffer) => void) {
  const chunks: Buffer[] = [];
  res.on('data', (chunk: Buffer) => chunks.push(chunk));
  res.on('end', () => callback(null, Buffer.concat(chunks)));
}

interface ImportRow {
  sheet: string;
  cell: string;
  fundName: string;
  amount: string;
  type: string;
  description: string | null;
  occurredOn: string;
  dedupeHash: string;
  duplicate?: boolean;
}

describe('Import/Export (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(GLOBAL_PREFIX);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    dataSource = moduleFixture.get(DataSource);

    const email = `e2e.import-export.${Date.now()}@wealet.test`;
    const registerRes = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/register`)
      .send({ email, password: 'Sup3rSecret!', displayName: 'Import Export' })
      .expect(201);

    accessToken = registerRes.body.accessToken;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM users WHERE id = $1', [userId]);
    await app.close();
  });

  it('previews, commits, re-previews as duplicate, and exports', async () => {
    const fileBuffer = await buildLedgerBuffer();

    const firstPreview = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/import/preview`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', fileBuffer, 'ledger.xlsx')
      .expect(201);

    expect(firstPreview.body.errors).toEqual([]);
    expect(firstPreview.body.unknownFunds).toEqual([FUND_NAME]);
    expect(firstPreview.body.rows).toHaveLength(1);
    const previewedRow: ImportRow = firstPreview.body.rows[0];
    expect(previewedRow.duplicate).toBe(false);
    expect(previewedRow.amount).toBe('5000');
    expect(previewedRow.type).toBe('expense');
    expect(previewedRow.description).toBe('Compra E2E');
    expect(previewedRow.occurredOn).toBe('2026-03-01');

    const commitResult = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/import/commit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ rows: firstPreview.body.rows })
      .expect(201);

    expect(commitResult.body.imported).toBe(1);
    expect(commitResult.body.skippedDuplicates).toBe(0);
    expect(commitResult.body.createdFunds).toEqual([FUND_NAME]);

    const secondPreview = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/import/preview`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', fileBuffer, 'ledger.xlsx')
      .expect(201);

    expect(secondPreview.body.rows).toHaveLength(1);
    expect((secondPreview.body.rows[0] as ImportRow).duplicate).toBe(true);

    const secondCommit = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/import/commit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ rows: secondPreview.body.rows })
      .expect(201);

    expect(secondCommit.body.imported).toBe(0);
    expect(secondCommit.body.skippedDuplicates).toBe(1);

    const exportRes = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/export`)
      .query({ from: '2026-03-01', to: '2026-03-31' })
      .set('Authorization', `Bearer ${accessToken}`)
      .buffer()
      .parse(bufferParser)
      .expect(200);

    expect(exportRes.headers['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    const exportedWorkbook = new Workbook();
    await exportedWorkbook.xlsx.load(exportRes.body as never);
    const exportedSheet = exportedWorkbook.worksheets[0];
    const headerRow = exportedSheet.getRow(1).values as unknown[];
    const dataRow = exportedSheet.getRow(2).values as unknown[];
    const exportedRow = Object.fromEntries(
      headerRow
        .map((header, i) => [header, dataRow[i]] as const)
        .filter(([header]) => header !== undefined),
    );

    expect(exportedSheet.actualRowCount).toBe(2); // header + 1 data row
    expect(exportedRow.Fondo).toBe(FUND_NAME);
    expect(exportedRow.Monto).toBe(-5000);
    expect(exportedRow.Descripcion).toBe('Compra E2E');
  });

  it('requires a year for sheets without one, then previews using the provided year', async () => {
    const data: unknown[][] = [
      [],
      [null, null, null, null, FUND_NAME],
      [null, null, null, null, 0],
      [null, null, null, null, -3000],
      [null, null, null, null, 0],
    ];
    const workbook = new Workbook();
    aoaToWorksheet(workbook, 'Plantilla Abril', data);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const withoutYear = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/import/preview`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', buffer, 'no-year.xlsx')
      .expect(201);

    expect(withoutYear.body.needsYear).toBe(true);
    expect(withoutYear.body.rows).toEqual([]);

    const withYear = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/import/preview`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('year', '2026')
      .attach('file', buffer, 'no-year.xlsx')
      .expect(201);

    expect(withYear.body.needsYear).toBe(false);
    expect(withYear.body.rows).toHaveLength(1);
    expect(withYear.body.rows[0].occurredOn).toBe('2026-04-01');
  });

  it('rejects a year outside the valid range', async () => {
    const fileBuffer = await buildLedgerBuffer();

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/import/preview`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('year', '1999')
      .attach('file', fileBuffer, 'ledger.xlsx')
      .expect(400);

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/import/preview`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('year', '2101')
      .attach('file', fileBuffer, 'ledger.xlsx')
      .expect(400);
  });
});
