import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stablecoin_reserves')
export class StablecoinReserveEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  circulatingSupply: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  goldOz: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  goldPriceUsd: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  reserveValueUsd: string;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  backingRatioPct: string;

  @Column({ type: 'decimal', precision: 8, scale: 6 })
  discrepancyPct: string;

  @Column()
  withinTolerance: boolean;

  @Column({ nullable: true })
  custodianRef?: string;

  @CreateDateColumn()
  createdAt: Date;
}
