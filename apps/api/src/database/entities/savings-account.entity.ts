import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('savings_accounts')
export class SavingsAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column()
  walletId: string;

  @Column()
  label: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  targetAmount?: string;

  @CreateDateColumn()
  createdAt: Date;
}
