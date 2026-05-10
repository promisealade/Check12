import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type AmlAlertStatus = 'pending' | 'cleared' | 'escalated';

@Entity('aml_alerts')
export class AmlAlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  transactionId: string;

  @Index()
  @Column()
  userId: string;

  @Column()
  ruleTriggered: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: ['pending', 'cleared', 'escalated'], default: 'pending' })
  status: AmlAlertStatus;

  @Column({ nullable: true })
  officerId?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ default: false })
  sarFiled: boolean;

  @Column({ nullable: true })
  reviewedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
