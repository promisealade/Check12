import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type KycDocumentType =
  | 'national_id'
  | 'passport'
  | 'drivers_license'
  | 'business_registration'
  | 'director_id'
  | 'selfie';

export type KycDocumentStatus = 'pending' | 'approved' | 'rejected' | 'requires_more_info';

@Entity('kyc_documents')
export class KycDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column({ type: 'varchar' })
  documentType: KycDocumentType;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'requires_more_info'], default: 'pending' })
  status: KycDocumentStatus;

  @Column({ nullable: true })
  filePath?: string;

  @Column({ nullable: true })
  providerRef?: string;

  @Column({ nullable: true })
  reviewerId?: string;

  @Column({ nullable: true })
  reviewNotes?: string;

  @Column({ nullable: true })
  reviewedAt?: Date;

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
