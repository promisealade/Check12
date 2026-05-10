import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type NotificationType =
  | 'transfer_received'
  | 'payment_collected'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'conversion_complete'
  | 'new_device_login'
  | 'funding_complete'
  | 'withdrawal_complete';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column({ type: 'varchar' })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true })
  actionUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
