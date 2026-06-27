import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum HealthFramework {
  FIFTY_THIRTY_TWENTY = '50_30_20',
  JARS_EKER = 'jars_eker',
  FONDOS = 'fondos',
}

@Entity('health_profiles')
export class HealthProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: HealthFramework,
    default: HealthFramework.FONDOS,
  })
  framework: HealthFramework;

  @Column({ name: 'monthly_income', type: 'bigint', nullable: true })
  monthlyIncome: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
