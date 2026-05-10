import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type UserType = 'individual' | 'business';
export type KycStatus = 'pending' | 'approved' | 'rejected' | 'requires_more_info';
export type KybStatus = 'not_started' | 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'business' | 'compliance_officer' | 'kyc_reviewer' | 'admin' | 'super_admin';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  phone: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: ['individual', 'business'], default: 'individual' })
  type: UserType;

  @Column({ type: 'enum', enum: ['user', 'business', 'compliance_officer', 'kyc_reviewer', 'admin', 'super_admin'], default: 'user' })
  role: UserRole;

  @Column({ type: 'smallint', default: 0 })
  tier: number;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'requires_more_info'], default: 'pending' })
  kycStatus: KycStatus;

  @Column({ nullable: true })
  businessName?: string;

  @Column({ nullable: true })
  registrationNumber?: string;

  @Column({ type: 'enum', enum: ['not_started', 'pending', 'approved', 'rejected'], default: 'not_started' })
  kybStatus: KybStatus;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  totpSecret?: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  dailyLimitUsd?: number;

  @Column({ nullable: true })
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
