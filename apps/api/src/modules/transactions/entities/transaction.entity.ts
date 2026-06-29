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
import { TransactionType } from '../../../common/enums/transaction-type.enum';
import { Category } from '../../categories/entities/category.entity';
import { Fund } from '../../funds/entities/fund.entity';
import { User } from '../../users/entities/user.entity';

export enum TransactionSource {
  MANUAL = 'manual',
  IMPORT = 'import',
}

@Entity('transactions')
@Index(['userId', 'occurredOn'])
@Index(['userId', 'fundId', 'occurredOn'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'fund_id', type: 'uuid' })
  fundId: string;

  @ManyToOne(() => Fund)
  @JoinColumn({ name: 'fund_id' })
  fund: Fund;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ type: 'char', length: 3, default: 'CLP' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ name: 'occurred_on', type: 'date' })
  occurredOn: string;

  @Column({ name: 'dedupe_hash', type: 'text', nullable: true })
  dedupeHash: string | null;

  @Column({
    type: 'enum',
    enum: TransactionSource,
    default: TransactionSource.MANUAL,
  })
  source: TransactionSource;

  @Column({ name: 'monthly_allocation_id', type: 'uuid', nullable: true })
  monthlyAllocationId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
