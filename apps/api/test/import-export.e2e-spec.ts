import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import * as XLSX from 'xlsx';
import { AppModule } from '../src/app.module';

const GLOBAL_PREFIX = 'api/v1';
const SHEET_NAME = 'Marzo 2026';
const FUND_NAME = 'Fondo E2E Test';

function buildLedgerBuffer(): Buffer {
  const data: unknown[][] = [
    [],
    [null, null, null, null, FUND_NAME],
    [null, null, null, null, 0],
    [null, 'Sueldo Líquido', 'Total'],
    [],
    [null, null, null, 'Total c/u', 0],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const cells = worksheet as Record<string, XLSX.CellObject>;
  cells['E4'] = {
    t: 'n',
    v: -5000,
    c: [{ a: 'e2e', t: 'Compra E2E' }],
  };
  worksheet['!ref'] = 'A1:E6';

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
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
      .send({ email, password: 'Sup3rSecret!' })
      .expect(201);

    accessToken = registerRes.body.accessToken;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM users WHERE id = $1', [userId]);
    await app.close();
  });

  it('previews, commits, re-previews as duplicate, and exports', async () => {
    const fileBuffer = buildLedgerBuffer();

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

    const exportedWorkbook = XLSX.read(exportRes.body as Buffer, {
      type: 'buffer',
    });
    const exportedSheet =
      exportedWorkbook.Sheets[exportedWorkbook.SheetNames[0]];
    const exportedRows: Array<Record<string, unknown>> =
      XLSX.utils.sheet_to_json(exportedSheet);

    expect(exportedRows).toHaveLength(1);
    expect(exportedRows[0].Fondo).toBe(FUND_NAME);
    expect(exportedRows[0].Monto).toBe(-5000);
    expect(exportedRows[0].Descripcion).toBe('Compra E2E');
  });
});
