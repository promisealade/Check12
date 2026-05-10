import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmlAlertEntity } from '../../database/entities/aml-alert.entity';
import { AuditLogEntity } from '../../database/entities/audit-log.entity';
import { KycDocumentEntity } from '../../database/entities/kyc-document.entity';
import { StablecoinReserveEntity } from '../../database/entities/stablecoin-reserve.entity';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { UserEntity } from '../../database/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(KycDocumentEntity)
    private readonly kycDocs: Repository<KycDocumentEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txns: Repository<TransactionEntity>,
    @InjectRepository(AmlAlertEntity)
    private readonly amlAlerts: Repository<AmlAlertEntity>,
    @InjectRepository(StablecoinReserveEntity)
    private readonly reserves: Repository<StablecoinReserveEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogs: Repository<AuditLogEntity>,
  ) {}

  // ─── Platform metrics ──────────────────────────────────────────────────────

  async getMetrics() {
    const [totalUsers, pendingKyc, pendingAml, totalTxns] = await Promise.all([
      this.users.count({ where: {} }),
      this.kycDocs.count({ where: { status: 'pending' } }),
      this.amlAlerts.count({ where: { status: 'pending' } }),
      this.txns.count({ where: {} }),
    ]);

    const volumeResult = await this.txns
      .createQueryBuilder('tx')
      .select('tx.currency', 'currency')
      .addSelect('SUM(CAST(tx.amount AS DECIMAL))', 'volume')
      .where("tx.status = 'completed'")
      .groupBy('tx.currency')
      .getRawMany<{ currency: string; volume: string }>();

    return {
      totalUsers,
      pendingKyc,
      pendingAml,
      totalTransactions: totalTxns,
      volume: volumeResult,
    };
  }

  // ─── KYC queue ─────────────────────────────────────────────────────────────

  async getKycQueue() {
    const docs = await this.kycDocs.find({
      where: { status: 'pending' },
      order: { submittedAt: 'ASC' },
      take: 50,
    });

    const enriched = await Promise.all(
      docs.map(async (doc) => {
        const user = await this.users.findOne({ where: { id: doc.userId } });
        return {
          docId: doc.id,
          userId: doc.userId,
          email: user?.email,
          phone: user?.phone,
          documentType: doc.documentType,
          submittedAt: doc.submittedAt,
        };
      }),
    );

    return enriched;
  }

  async reviewKyc(
    adminId: string,
    docId: string,
    decision: 'approved' | 'rejected',
    notes?: string,
  ) {
    const doc = await this.kycDocs.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException('KYC document not found');

    await this.kycDocs.update(doc.id, {
      status: decision,
      reviewerId: adminId,
      reviewNotes: notes,
      reviewedAt: new Date(),
    });

    // Audit log
    await this.auditLogs.save(
      this.auditLogs.create({
        actorId: adminId,
        action: `kyc_${decision}`,
        targetId: doc.id,
        targetType: 'kyc_document',
        metadata: { userId: doc.userId, documentType: doc.documentType, notes },
      }),
    );

    return { docId, decision };
  }

  // ─── AML alerts ────────────────────────────────────────────────────────────

  async getAmlAlerts(status?: string) {
    const where: Record<string, string> = {};
    if (status) where.status = status;

    return this.amlAlerts.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async reviewAmlAlert(
    officerId: string,
    alertId: string,
    decision: 'cleared' | 'escalated',
    sarFiled?: boolean,
    notes?: string,
  ) {
    const alert = await this.amlAlerts.findOne({ where: { id: alertId } });
    if (!alert) throw new NotFoundException('AML alert not found');

    await this.amlAlerts.update(alertId, {
      status: decision,
      officerId,
      notes,
      sarFiled: sarFiled ?? false,
      reviewedAt: new Date(),
    });

    await this.auditLogs.save(
      this.auditLogs.create({
        actorId: officerId,
        action: `aml_${decision}`,
        targetId: alertId,
        targetType: 'aml_alert',
        metadata: { sarFiled, notes },
      }),
    );

    return { alertId, decision };
  }

  // ─── Reserve reports ───────────────────────────────────────────────────────

  async getReserves() {
    return this.reserves.find({
      order: { date: 'DESC' },
      take: 30,
    });
  }

  // ─── Users ─────────────────────────────────────────────────────────────────

  async listUsers(page = 1, limit = 20) {
    const [users, total] = await this.users.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        type: u.type,
        role: u.role,
        tier: u.tier,
        kycStatus: u.kycStatus,
        kybStatus: u.kybStatus,
        createdAt: u.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}
