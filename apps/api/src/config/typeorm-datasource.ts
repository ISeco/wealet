import 'dotenv/config';
import { DataSource } from 'typeorm';
import { isRemoteDatabase } from './is-remote-database-url';

export default new DataSource({
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
  ssl: isRemoteDatabase(process.env.DATABASE_URL, process.env.DB_HOST)
    ? { rejectUnauthorized: false }
    : false,
});
