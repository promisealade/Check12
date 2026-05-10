import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('api_keys')
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column({ length: 12 })
  keyPrefix: string;

  @Column()
  keyHash: string;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];

  @Column({ nullable: true })
  lastUsedAt?: Date;

  @Column({ nullable: true })
  revokedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
