import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletModule } from '../wallet/wallet.module';
import { FundingController } from './funding.controller';
import { FundingService } from './funding.service';

@Module({
  imports: [WalletModule, TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [FundingController],
  providers: [FundingService],
})
export class FundingModule {}
