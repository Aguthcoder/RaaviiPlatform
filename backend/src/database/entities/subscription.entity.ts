import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

export type PaymentProvider = 'zarinpal' | 'stripe';

@Entity({ name: 'subscriptions' })
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'plan', default: 'premium' })
  plan!: string;

  @Column({ name: 'provider', default: 'stripe' })
  provider!: PaymentProvider;

  @Column({ name: 'status', default: 'active' })
  status!: string;

  @Column({ name: 'amount', type: 'int', default: 0 })
  amount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
