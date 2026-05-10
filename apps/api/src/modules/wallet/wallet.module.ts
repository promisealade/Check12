import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerEventEntity } from '../../database/entities/ledger-event.entity';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletEntity } from '../../database/entities/wallet.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([WalletEntity, LedgerEventEntity, TransactionEntity])],
  controllers: [WalletController, TransactionsController],
  providers: [WalletService, TransactionsService],
  exports: [WalletService],
})
export class WalletModule {}
