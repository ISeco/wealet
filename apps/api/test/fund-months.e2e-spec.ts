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

describe('GET /transactions/months (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userA: TestUser;
  let userB: TestUser;
  let fundOfA: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userA = await registerTestUser(app, 'fund-months-a');
    userB = await registerTestUser(app, 'fund-months-b');

    const fundA = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ name: 'Fondo con historial', classification: 'available' })
      .expect(201);
    fundOfA = fundA.body.id;

    const categoryA = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/categories`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ name: 'Categoria fund-months', type: 'expense' })
      .expect(201);
    const categoryOfA = categoryA.body.id;

    // Simulates an Excel import: the fund row is created today (via the API
    // call above), but the transaction is dated in a month long before that.
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/transactions`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        fundId: fundOfA,
        categoryId: categoryOfA,
        type: 'expense',
        amount: '1000',
        occurredOn: '2020-03-15',
      })
      .expect(201);
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userA.userId, userB.userId]);
    await app.close();
  });

  it('includes months older than the fund and the current month, even with no transactions this month', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/transactions/months?fundId=${fundOfA}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const currentMonth = new Date().toISOString().slice(0, 7);
    expect(res.body).toContain('2020-03');
    expect(res.body).toContain(currentMonth);
  });

  it('does not leak months from another user fund', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/transactions/months?fundId=${fundOfA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);

    const currentMonth = new Date().toISOString().slice(0, 7);
    expect(res.body).toEqual([currentMonth]);
  });

  it('returns 400 for a malformed fundId', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/transactions/months?fundId=not-a-uuid`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(400);
  });
});
