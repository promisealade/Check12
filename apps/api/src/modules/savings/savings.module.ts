import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsAccountEntity } from '../../database/entities/savings-account.entity';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletModule } from '../wallet/wallet.module';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';

@Module({
  imports: [WalletModule, TypeOrmModule.forFeature([SavingsAccountEntity, TransactionEntity])],
  controllers: [SavingsController],
  providers: [SavingsService],
})
export class SavingsModule {}
