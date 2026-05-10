import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';

@Module({
  imports: [WalletModule, TypeOrmModule.forFeature([TransactionEntity, UserEntity])],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
