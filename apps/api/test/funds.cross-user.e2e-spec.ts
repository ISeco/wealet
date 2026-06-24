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

describe('Funds cross-user isolation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userA: TestUser;
  let userB: TestUser;
  let fundOfA: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userA = await registerTestUser(app, 'funds-a');
    userB = await registerTestUser(app, 'funds-b');

    const createRes = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ name: 'Fondo de A', classification: 'available' })
      .expect(201);
    fundOfA = createRes.body.id;
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userA.userId, userB.userId]);
    await app.close();
  });

  it('does not list the other user fund', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/funds`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);
    expect(res.body.find((f: { id: string }) => f.id === fundOfA)).toBeUndefined();
  });

  it('returns 404 when user B reads user A fund by id', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/funds/${fundOfA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);
  });

  it('returns 404 when user B reads user A fund history', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/funds/${fundOfA}/history`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);
  });

  it('returns 404 when user B updates user A fund', async () => {
    await request(app.getHttpServer())
      .patch(`/${GLOBAL_PREFIX}/funds/${fundOfA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({ name: 'Hijacked' })
      .expect(404);
  });

  it('returns 404 when user B deletes user A fund', async () => {
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/funds/${fundOfA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);
  });

  it('user A fund is untouched after user B attempts', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/funds/${fundOfA}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);
    expect(res.body.name).toBe('Fondo de A');
  });
});
