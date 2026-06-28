import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import {
  GLOBAL_PREFIX,
  TestUser,
  createTestApp,
  deleteTestUsers,
  registerTestUser,
} from './utils/test-app';

describe('Reports cross-user isolation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userA: TestUser;
  let userB: TestUser;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userA = await registerTestUser(app, 'reports-a');
    userB = await registerTestUser(app, 'reports-b');

    const fundA = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        name: 'Fondo reports A',
        classification: 'available',
        countsForRunway: true,
      })
      .expect(201);

    const categoryA = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/categories`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ name: 'Categoria reports A', type: 'income' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/transactions`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        fundId: fundA.body.id,
        categoryId: categoryA.body.id,
        type: 'income',
        amount: '1000000',
        occurredOn: '2026-06-01',
      })
      .expect(201);
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userA.userId, userB.userId]);
    await app.close();
  });

  it("user B summary does not include user A's income", async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/reports/summary`)
      .query({ from: '2026-01-01', to: '2026-12-31' })
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);

    expect(res.body).toEqual({ balance: '0', income: '0', expense: '0' });
  });

  it("user B by-category breakdown does not include user A's category", async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/reports/by-category`)
      .query({ from: '2026-01-01', to: '2026-12-31' })
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it("user B net worth does not include user A's fund balance", async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/reports/net-worth`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);

    expect(res.body).toMatchObject({
      available: '0',
      reserve: '0',
      committed: '0',
    });
  });

  it("user B runway does not include user A's cushion", async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/reports/runway`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);

    expect(res.body.cushion).toBe('0');
  });

  it("user B cash flow does not include user A's income", async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/reports/cash-flow`)
      .query({ months: 12 })
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);

    for (const point of res.body) {
      expect(point.income).toBe('0');
      expect(point.expense).toBe('0');
    }
  });
});
