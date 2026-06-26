import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    url: process.env.DATABASE_URL,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
    migrations: [`${__dirname}/../database/migrations/*{.ts,.js}`],
    synchronize: false,
    migrationsRun: false,
    ssl: process.env.DATABASE_URL?.includes('render.com')
      ? { rejectUnauthorized: false }
      : false,
  }),
);
