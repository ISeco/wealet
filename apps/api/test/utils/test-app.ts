import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

export const GLOBAL_PREFIX = 'api/v1';

export interface TestUser {
  userId: string;
  accessToken: string;
}

export async function createTestApp(): Promise<{
  app: INestApplication<App>;
  dataSource: DataSource;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  return { app, dataSource: moduleFixture.get(DataSource) };
}

interface RegisterResponseBody {
  accessToken: string;
  user: { id: string };
}

export async function registerTestUser(
  app: INestApplication<App>,
  label: string,
): Promise<TestUser> {
  const email = `e2e.${label}.${Date.now()}.${Math.random().toString(36).slice(2)}@wealet.test`;
  const res = await request(app.getHttpServer())
    .post(`/${GLOBAL_PREFIX}/auth/register`)
    .send({ email, password: 'Sup3rSecret!', displayName: label })
    .expect(201);

  const body = res.body as RegisterResponseBody;
  return { userId: body.user.id, accessToken: body.accessToken };
}

export async function deleteTestUsers(
  dataSource: DataSource,
  userIds: string[],
): Promise<void> {
  if (userIds.length === 0) {
    return;
  }
  await dataSource.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
}
