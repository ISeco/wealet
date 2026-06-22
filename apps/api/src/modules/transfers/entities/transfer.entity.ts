import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Fund } from '../../funds/entities/fund.entity';
import { User } from '../../users/entities/user.entity';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'from_fund_id', type: 'uuid' })
  fromFundId: string;

  @ManyToOne(() => Fund)
  @JoinColumn({ name: 'from_fund_id' })
  fromFund: Fund;

  @Column({ name: 'to_fund_id', type: 'uuid' })
  toFundId: string;

  @ManyToOne(() => Fund)
  @JoinColumn({ name: 'to_fund_id' })
  toFund: Fund;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ type: 'char', length: 3, default: 'CLP' })
  currency: string;

  @Column({ name: 'occurred_on', type: 'date' })
  occurredOn: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
