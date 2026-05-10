import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentLinkEntity } from '../../database/entities/payment-link.entity';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletModule } from '../wallet/wallet.module';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  imports: [WalletModule, TypeOrmModule.forFeature([PaymentLinkEntity, TransactionEntity])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
