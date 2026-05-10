import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type TransactionType =
  | 'funding'
  | 'withdrawal'
  | 'conversion'
  | 'transfer_sent'
  | 'transfer_received'
  | 'collection'
  | 'savings_deposit'
  | 'savings_withdrawal';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';
export type AmlStatus = 'pending' | 'cleared' | 'flagged' | 'escalated';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: ['funding', 'withdrawal', 'conversion', 'transfer_sent', 'transfer_received', 'collection', 'savings_deposit', 'savings_withdrawal'] })
  type: TransactionType;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed', 'reversed'], default: 'pending' })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column()
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: '0' })
  fee: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  exchangeRate?: string;

  @Column({ nullable: true })
  counterpartyId?: string;

  @Column({ nullable: true })
  counterpartyDisplay?: string;

  @Column({ nullable: true })
  payerReference?: string;

  @Index({ unique: true })
  @Column()
  idempotencyKey: string;

  @Column({ type: 'enum', enum: ['pending', 'cleared', 'flagged', 'escalated'], default: 'pending' })
  amlStatus: AmlStatus;

  @Column({ type: 'jsonb', nullable: true })
  travelRuleData?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ nullable: true })
  settledAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
