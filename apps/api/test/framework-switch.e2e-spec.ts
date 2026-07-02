import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import {
  createTestApp,
  deleteTestUsers,
  GLOBAL_PREFIX,
  registerTestUser,
} from './utils/test-app';

interface FundResponseBody {
  id: string;
  name: string;
  frameworkSlot: string | null;
  archivedAt: string | null;
}

describe('Framework switching (PUT /health/profile)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    ({ accessToken, userId } = await registerTestUser(app, 'framework-switch'));
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userId]);
    await app.close();
  });

  it('switches 50_30_20 -> jars_eker -> 50_30_20 without 500s and never shows two active funds with the same name', async () => {
    // both 50_30_20 and jars_eker have a "Necesidades" slot fund, which is
    // exactly the scenario that previously violated the partial unique
    // index (user_id, name) WHERE archived_at IS NULL
    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/health/profile`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ framework: '50_30_20' })
      .expect(200);

    await assertNoDuplicateActiveNames(app, accessToken);

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/health/profile`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ framework: 'jars_eker' })
      .expect(200);

    await assertNoDuplicateActiveNames(app, accessToken);

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/health/profile`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ framework: '50_30_20' })
      .expect(200);

    await assertNoDuplicateActiveNames(app, accessToken);
  });
});

async function assertNoDuplicateActiveNames(
  app: INestApplication<App>,
  accessToken: string,
): Promise<void> {
  const res = await request(app.getHttpServer())
    .get(`/${GLOBAL_PREFIX}/funds`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200);

  const funds = res.body as FundResponseBody[];
  const activeNames = funds
    .filter((f) => f.archivedAt === null)
    .map((f) => f.name);
  const uniqueNames = new Set(activeNames);
  expect(uniqueNames.size).toBe(activeNames.length);
}
