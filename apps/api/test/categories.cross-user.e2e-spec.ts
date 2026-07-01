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

describe('Categories cross-user isolation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userA: TestUser;
  let userB: TestUser;
  let categoryOfA: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userA = await registerTestUser(app, 'categories-a');
    userB = await registerTestUser(app, 'categories-b');

    const categoryA = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/categories`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ name: 'Categoria privada de A', type: 'expense' })
      .expect(201);
    categoryOfA = categoryA.body.id;
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userA.userId, userB.userId]);
    await app.close();
  });

  it('does not list user A custom category for user B', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/categories`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);
    expect(
      res.body.find((c: { id: string }) => c.id === categoryOfA),
    ).toBeUndefined();
  });

  it('returns 404 when user B updates user A category', async () => {
    await request(app.getHttpServer())
      .patch(`/${GLOBAL_PREFIX}/categories/${categoryOfA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({ name: 'Hijacked' })
      .expect(404);
  });

  it('returns 404 when user B deletes user A category', async () => {
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/categories/${categoryOfA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);
  });

  it('user A category is untouched after user B attempts', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/categories`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);
    expect(
      res.body.find((c: { id: string }) => c.id === categoryOfA)?.name,
    ).toBe('Categoria privada de A');
  });
});
