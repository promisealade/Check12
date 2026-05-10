import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type LedgerEventType = 'credit' | 'debit';
export type LedgerReferenceType =
  | 'transfer'
  | 'conversion'
  | 'funding'
  | 'withdrawal'
  | 'collection'
  | 'savings_deposit'
  | 'savings_withdrawal'
  | 'reversal';

/**
 * Append-only immutable ledger. Never UPDATE or DELETE rows.
 * Balance = SUM(credits) - SUM(debits) for a wallet.
 */
@Entity('ledger_events')
export class LedgerEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  walletId: string;

  @Column({ type: 'enum', enum: ['credit', 'debit'] })
  type: LedgerEventType;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column()
  currency: string;

  @Column({ nullable: true })
  referenceId?: string;

  @Column({ type: 'enum', enum: ['transfer', 'conversion', 'funding', 'withdrawal', 'collection', 'savings_deposit', 'savings_withdrawal', 'reversal'], nullable: true })
  referenceType?: LedgerReferenceType;

  @Index({ unique: true })
  @Column()
  idempotencyKey: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
