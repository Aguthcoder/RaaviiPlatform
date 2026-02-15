import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EventEntity } from './event.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'event_reservations' })
@Unique('uq_event_reservations_event_user', ['eventId', 'userId'])
export class EventReservationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_id' })
  eventId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'seats', type: 'int', default: 1 })
  seats!: number;

  @Column({ name: 'payment_status', length: 20, default: 'pending' })
  paymentStatus!: 'pending' | 'paid' | 'failed';

  @Column({ name: 'payment_reference', nullable: true, length: 120 })
  paymentReference?: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => EventEntity, (event) => event.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @ManyToOne(() => UserEntity, (user) => user.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
