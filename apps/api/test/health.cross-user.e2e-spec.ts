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

describe('Health profile cross-user isolation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userA: TestUser;
  let userB: TestUser;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userA = await registerTestUser(app, 'health-a');
    userB = await registerTestUser(app, 'health-b');

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/health/profile`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ monthlyIncome: '500000' })
      .expect(200);
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userA.userId, userB.userId]);
    await app.close();
  });

  it("user B profile is not user A's customized profile", async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/health/profile`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);

    expect(res.body.userId).toBe(userB.userId);
    expect(res.body.monthlyIncome).not.toBe('500000');
    expect(res.body.framework).toBe('fondos');
  });

  it('user A profile keeps its own customization', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/health/profile`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    expect(res.body.monthlyIncome).toBe('500000');
  });

  it("user B updating their profile does not affect user A's profile", async () => {
    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/health/profile`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({ monthlyIncome: '999999' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/health/profile`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    expect(res.body.monthlyIncome).toBe('500000');
  });
});
