import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletModule } from '../wallet/wallet.module';
import { StablecoinController } from './stablecoin.controller';
import { StablecoinService } from './stablecoin.service';

@Module({
  imports: [WalletModule, TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [StablecoinController],
  providers: [StablecoinService],
})
export class StablecoinModule {}
