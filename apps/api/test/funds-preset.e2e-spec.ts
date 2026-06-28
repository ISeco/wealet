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

describe('POST /funds/preset', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    ({ accessToken, userId } = await registerTestUser(app, 'preset-pf'));
  });

  afterAll(async () => {
    await deleteTestUsers(dataSource, [userId]);
    await app.close();
  });

  it('creates 4 profit_first funds with correct slots and percentages', async () => {
    const res = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds/preset`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ preset: 'profit_first' })
      .expect(201);

    const funds = res.body as Array<{
      name: string;
      frameworkSlot: string;
      targetPercentage: number;
    }>;

    expect(funds).toHaveLength(4);
    expect(funds.map((f) => f.frameworkSlot)).toEqual(
      expect.arrayContaining([
        'profit_first:estilo_de_vida',
        'profit_first:diversion',
        'profit_first:inversion',
        'profit_first:seguridad',
      ]),
    );

    const estilo = funds.find(
      (f) => f.frameworkSlot === 'profit_first:estilo_de_vida',
    );
    expect(estilo?.targetPercentage).toBe(55);
  });

  it('rejects the old sobres value', async () => {
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/funds/preset`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ preset: 'sobres' })
      .expect(400);
  });
});
