import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { TransactionEntity } from '../../database/entities/transaction.entity';

interface ListOptions {
  page: number;
  limit: number;
  currency?: string;
  type?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly txns: Repository<TransactionEntity>,
  ) {}

  async list(userId: string, opts: ListOptions) {
    const where: FindOptionsWhere<TransactionEntity> = { userId };

    if (opts.currency) where.currency = opts.currency;
    if (opts.type) where.type = opts.type as any;
    if (opts.from && opts.to) {
      where.createdAt = Between(new Date(opts.from), new Date(opts.to));
    }

    const [rows, total] = await this.txns.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: opts.limit,
      skip: (opts.page - 1) * opts.limit,
    });

    return {
      transactions: rows.map(formatTx),
      pagination: {
        page: opts.page,
        limit: opts.limit,
        total,
        pages: Math.ceil(total / opts.limit),
      },
    };
  }

  async exportCsv(
    userId: string,
    opts: { currency?: string; from?: string; to?: string },
  ): Promise<string> {
    const where: FindOptionsWhere<TransactionEntity> = { userId };
    if (opts.currency) where.currency = opts.currency;
    if (opts.from && opts.to) {
      where.createdAt = Between(new Date(opts.from), new Date(opts.to));
    }

    const rows = await this.txns.find({
      where,
      order: { createdAt: 'DESC' },
      take: 1000,
    });

    const header = 'Date,Type,Amount,Currency,Fee,Status,Counterparty,AML Status\n';
    const lines = rows
      .map((t) =>
        [
          new Date(t.createdAt).toISOString(),
          t.type,
          t.amount,
          t.currency,
          t.fee,
          t.status,
          t.counterpartyDisplay ?? '',
          t.amlStatus,
        ].join(','),
      )
      .join('\n');

    return header + lines;
  }
}

function formatTx(t: TransactionEntity) {
  return {
    id: t.id,
    type: t.type,
    status: t.status,
    amount: t.amount,
    currency: t.currency,
    fee: t.fee,
    exchangeRate: t.exchangeRate,
    counterpartyDisplay: t.counterpartyDisplay,
    amlStatus: t.amlStatus,
    settledAt: t.settledAt,
    createdAt: t.createdAt,
  };
}
