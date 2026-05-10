import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';
        const databaseUrl = config.get<string>('DATABASE_URL');
        const connection = databaseUrl
          ? { url: databaseUrl }
          : {
              host: config.get('DB_HOST', 'localhost'),
              port: config.get<number>('DB_PORT', 5432),
              database: config.get('DB_NAME', 'afrione'),
              username: config.get<string>('DB_USER'),
              password: config.get<string>('DB_PASSWORD'),
            };
        return {
          type: 'postgres' as const,
          ...connection,
          ssl: isProd || config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
          entities: [__dirname + '/entities/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize: false,
          logging: !isProd,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
