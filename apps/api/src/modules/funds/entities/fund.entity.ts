import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FundClassification {
  AVAILABLE = 'available',
  RESERVE = 'reserve',
  COMMITTED = 'committed',
}

@Entity('funds')
export class Fund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  name: string;

  @Column({
    type: 'enum',
    enum: FundClassification,
  })
  classification: FundClassification;

  @Column({ type: 'text', nullable: true })
  color: string | null;

  @Column({ name: 'is_operative', type: 'boolean', default: false })
  isOperative: boolean;

  @Column({ name: 'counts_for_runway', type: 'boolean', default: false })
  countsForRunway: boolean;

  @Column({ name: 'framework_slot', type: 'text', nullable: true })
  frameworkSlot: string | null;

  @Column({ name: 'target_percentage', type: 'integer', nullable: true })
  targetPercentage: number | null;

  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
