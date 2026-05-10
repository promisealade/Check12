import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

const isProd = process.env.NODE_ENV === 'production';

function buildConnectionOptions() {
  // Railway / Neon / Supabase supply a single DATABASE_URL
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      ssl: isProd ? { rejectUnauthorized: false } : false,
    };
  }
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'afrione',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' || isProd ? { rejectUnauthorized: false } : false,
  };
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...buildConnectionOptions(),
  entities: [join(__dirname, 'entities/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  logging: !isProd,
});
