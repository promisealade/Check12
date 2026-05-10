import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmlAlertEntity } from '../../database/entities/aml-alert.entity';
import { AuditLogEntity } from '../../database/entities/audit-log.entity';
import { KycDocumentEntity } from '../../database/entities/kyc-document.entity';
import { StablecoinReserveEntity } from '../../database/entities/stablecoin-reserve.entity';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      KycDocumentEntity,
      TransactionEntity,
      AmlAlertEntity,
      StablecoinReserveEntity,
      AuditLogEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
