import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmlAlertEntity } from '../../database/entities/aml-alert.entity';
import { TransactionEntity } from '../../database/entities/transaction.entity';

// AML review actions are handled via AdminModule.
// This module registers entities for potential future dedicated AML service.
@Module({
  imports: [TypeOrmModule.forFeature([AmlAlertEntity, TransactionEntity])],
})
export class AmlModule {}
