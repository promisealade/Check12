import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerEventEntity } from '../../database/entities/ledger-event.entity';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletEntity } from '../../database/entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly wallets: Repository<WalletEntity>,
    @InjectRepository(LedgerEventEntity)
    private readonly ledger: Repository<LedgerEventEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txns: Repository<TransactionEntity>,
  ) {}

  // ─── Get all wallets with computed balances ─────────────────────────────────

  async getWalletsWithBalances(userId: string) {
    const wallets = await this.wallets.find({ where: { userId } });

    const walletsWithBalances = await Promise.all(
      wallets.map(async (w) => ({
        id: w.id,
        currency: w.currency,
        balance: await this.computeBalance(w.id),
        createdAt: w.createdAt,
      })),
    );

    return walletsWithBalances;
  }

  // ─── Get wallet dashboard (balances + recent txns) ─────────────────────────

  async getDashboard(userId: string) {
    const wallets = await this.getWalletsWithBalances(userId);

    const recentTransactions = await this.txns.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      wallets,
      recentTransactions: recentTransactions.map(formatTransaction),
    };
  }

  // ─── Get ledger events for a wallet ────────────────────────────────────────

  async getLedgerEvents(userId: string, walletId: string, page = 1, limit = 20) {
    const wallet = await this.wallets.findOne({ where: { id: walletId, userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const [events, total] = await this.ledger.findAndCount({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      walletId,
      currency: wallet.currency,
      balance: await this.computeBalance(walletId),
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        amount: e.amount,
        currency: e.currency,
        referenceType: e.referenceType,
        idempotencyKey: e.idempotencyKey,
        createdAt: e.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ─── Internal: compute balance by SUM of ledger events ─────────────────────

  async computeBalance(walletId: string): Promise<string> {
    const result = await this.ledger
      .createQueryBuilder('le')
      .select(
        `SUM(CASE WHEN le.type = 'credit' THEN le.amount ELSE -le.amount END)`,
        'balance',
      )
      .where('le.walletId = :walletId', { walletId })
      .getRawOne<{ balance: string | null }>();

    return result?.balance ?? '0.00000000';
  }

  // ─── Internal: append ledger event ─────────────────────────────────────────

  async appendLedgerEvent(
    walletId: string,
    type: 'credit' | 'debit',
    amount: string,
    currency: string,
    referenceType: LedgerEventEntity['referenceType'],
    idempotencyKey: string,
    referenceId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<LedgerEventEntity> {
    const event = this.ledger.create({
      walletId,
      type,
      amount,
      currency,
      referenceType,
      idempotencyKey,
      referenceId,
      metadata,
    });
    return this.ledger.save(event);
  }

  // ─── Get wallet by user + currency ─────────────────────────────────────────

  async getWalletByCurrency(userId: string, currency: 'AFRi' | 'xGHS'): Promise<WalletEntity> {
    const wallet = await this.wallets.findOne({ where: { userId, currency } });
    if (!wallet) throw new NotFoundException(`${currency} wallet not found`);
    return wallet;
  }

  async getWalletById(id: string, userId: string): Promise<WalletEntity> {
    const wallet = await this.wallets.findOne({ where: { id, userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }
}

function formatTransaction(t: TransactionEntity) {
  return {
    id: t.id,
    type: t.type,
    status: t.status,
    amount: t.amount,
    currency: t.currency,
    fee: t.fee,
    counterpartyDisplay: t.counterpartyDisplay,
    amlStatus: t.amlStatus,
    settledAt: t.settledAt,
    createdAt: t.createdAt,
  };
}
