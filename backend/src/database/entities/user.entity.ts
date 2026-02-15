import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { UserTelegramLinkEntity } from './user-telegram-link.entity';
import { EventReservationEntity } from './event-reservation.entity';
import { SubscriptionEntity } from './subscription.entity';
import { NotificationEntity } from './notification.entity';

export type SubscriptionPlan = 'free' | 'premium';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: true })
  email?: string | null;

  @Column({ name: 'mobile_number', unique: true, nullable: true, length: 20 })
  mobileNumber?: string | null;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  role?: string;

  @Column({ name: 'subscription_plan', default: 'free' })
  subscriptionPlan!: SubscriptionPlan;

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  profile?: ProfileEntity;

  @OneToMany(() => UserTelegramLinkEntity, (link) => link.user)
  telegramLinks?: UserTelegramLinkEntity[];

  @OneToMany(() => EventReservationEntity, (reservation) => reservation.user)
  reservations?: EventReservationEntity[];

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.user)
  subscriptions?: SubscriptionEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications?: NotificationEntity[];
}
