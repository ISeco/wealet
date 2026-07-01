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

describe('Transactions cross-user isolation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userA: TestUser;
  let userB: TestUser;
  let fundOfA: string;
  let fundOfB: string;
  let categoryOfA: string;
  let transactionOfA: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userA = await registerTestUser(app, 'tx-a');
    userB = await registerTestUser(app, 'tx-b');

    const fundA = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ name: 'Fondo A', classification: 'available' })
      .expect(201);
    fundOfA = fundA.body.id;

    const fundB = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({ name: 'Fondo B', classification: 'available' })
      .expect(201);
    fundOfB = fundB.body.id;

    const categoryA = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/categories`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ name: 'Categoria A', type: 'expense' })
      .expect(201);
    categoryOfA = categoryA.body.id;

    const transactionA = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/transactions`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        fundId: fundOfA,
        categoryId: categoryOfA,
        type: 'expense',
        amount: '1000',
        occurredOn: '2026-06-01',
      })
      .expect(201);
    transactionOfA = transactionA.body.id;
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userA.userId, userB.userId]);
    await app.close();
  });

  it('does not list user A transaction for user B', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/transactions`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);
    expect(
      res.body.data.find((t: { id: string }) => t.id === transactionOfA),
    ).toBeUndefined();
  });

  it('returns 404 when user B reads user A transaction', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/transactions/${transactionOfA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);
  });

  it('returns 404 when user B updates user A transaction', async () => {
    await request(app.getHttpServer())
      .patch(`/${GLOBAL_PREFIX}/transactions/${transactionOfA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({ description: 'Hijacked' })
      .expect(404);
  });

  it('returns 404 when user B deletes user A transaction', async () => {
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/transactions/${transactionOfA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);
  });

  it('returns 404 when user B creates a transaction against user A fund', async () => {
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/transactions`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({
        fundId: fundOfA,
        categoryId: categoryOfA,
        type: 'expense',
        amount: '500',
        occurredOn: '2026-06-02',
      })
      .expect(404);
  });

  it('returns 404 when user B creates a transaction against user A category', async () => {
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/transactions`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({
        fundId: fundOfB,
        categoryId: categoryOfA,
        type: 'expense',
        amount: '500',
        occurredOn: '2026-06-02',
      })
      .expect(404);
  });
});
