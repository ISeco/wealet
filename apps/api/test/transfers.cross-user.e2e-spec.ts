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

describe('Transfers cross-user isolation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userA: TestUser;
  let userB: TestUser;
  let fundOfA1: string;
  let fundOfA2: string;
  let fundOfB: string;
  let transferOfA: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userA = await registerTestUser(app, 'transfers-a');
    userB = await registerTestUser(app, 'transfers-b');

    const fundA1 = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ name: 'Fondo A1', classification: 'available' })
      .expect(201);
    fundOfA1 = fundA1.body.id;

    const fundA2 = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ name: 'Fondo A2', classification: 'reserve' })
      .expect(201);
    fundOfA2 = fundA2.body.id;

    const fundB = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({ name: 'Fondo B', classification: 'available' })
      .expect(201);
    fundOfB = fundB.body.id;

    const transferA = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/transfers`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        fromFundId: fundOfA1,
        toFundId: fundOfA2,
        amount: '1000',
        occurredOn: '2026-06-01',
      })
      .expect(201);
    transferOfA = transferA.body.id;
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userA.userId, userB.userId]);
    await app.close();
  });

  it('does not list user A transfer for user B', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/transfers`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);
    expect(
      res.body.find((t: { id: string }) => t.id === transferOfA),
    ).toBeUndefined();
  });

  it('returns 404 when user B transfers between user A funds', async () => {
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/transfers`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({
        fromFundId: fundOfA1,
        toFundId: fundOfA2,
        amount: '500',
        occurredOn: '2026-06-02',
      })
      .expect(404);
  });

  it('returns 404 when user B transfers from own fund to user A fund', async () => {
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/transfers`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({
        fromFundId: fundOfB,
        toFundId: fundOfA1,
        amount: '500',
        occurredOn: '2026-06-02',
      })
      .expect(404);
  });
});
