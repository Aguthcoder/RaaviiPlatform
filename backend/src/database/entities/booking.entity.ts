import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventEntity } from './event.entity';
import { UserEntity } from './user.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'waitlist';
export type BookingPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded' | 'failed';

@Entity({ name: 'bookings' })
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_id' })
  eventId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ default: 'pending' })
  status!: BookingStatus;

  @Column({ name: 'payment_status', default: 'unpaid' })
  paymentStatus!: BookingPaymentStatus;

  @Column({ name: 'payment_id', nullable: true })
  paymentId?: string;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountPaid?: string;

  @Column({ name: 'booking_code', nullable: true })
  bookingCode?: string;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => EventEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
