import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DatabaseModule } from './database/database.module';
import { IdentityModule } from './modules/identity/identity.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { StablecoinModule } from './modules/stablecoin/stablecoin.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { FundingModule } from './modules/funding/funding.module';
import { SavingsModule } from './modules/savings/savings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { AmlModule } from './modules/aml/aml.module';
import { KycModule } from './modules/kyc/kyc.module';
import { RedisModule } from './modules/redis/redis.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    RedisModule,
    IdentityModule,
    KycModule,
    WalletModule,
    StablecoinModule,
    TransfersModule,
    CollectionsModule,
    FundingModule,
    SavingsModule,
    NotificationsModule,
    AdminModule,
    AmlModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
})
export class AppModule {}
