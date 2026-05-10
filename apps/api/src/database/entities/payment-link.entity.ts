import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type PaymentLinkStatus = 'active' | 'paid' | 'expired';

@Entity('payment_links')
export class PaymentLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 12 })
  shortCode: string;

  @Index()
  @Column()
  merchantWalletId: string;

  @Column()
  merchantUserId: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column()
  currency: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['active', 'paid', 'expired'], default: 'active' })
  status: PaymentLinkStatus;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  paidAt?: Date;

  @Column({ nullable: true })
  payerReference?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
