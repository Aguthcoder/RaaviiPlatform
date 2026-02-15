import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EventReservationEntity } from './event-reservation.entity';
import { TelegramGroupEntity } from './telegram-group.entity';

@Entity({ name: 'events' })
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'category', nullable: true })
  category?: string;

  @Column({ name: 'event_type', nullable: true, length: 50 })
  eventType?: string;

  @Column({ nullable: true, length: 100 })
  city?: string;

  @Column({ name: 'target_personality_traits', type: 'text', array: true, nullable: true })
  targetPersonalityTraits?: string[];

  @Column({ name: 'tags', type: 'text', array: true, nullable: true })
  tags?: string[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'capacity', type: 'int', default: 20 })
  capacity!: number;

  @Column({ name: 'current_bookings', type: 'int', default: 0 })
  reservedCount!: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date;

  @OneToMany(() => EventReservationEntity, (reservation) => reservation.event)
  reservations?: EventReservationEntity[];

  @OneToOne(() => TelegramGroupEntity, (telegramGroup) => telegramGroup.event)
  telegramGroup?: TelegramGroupEntity;
}
