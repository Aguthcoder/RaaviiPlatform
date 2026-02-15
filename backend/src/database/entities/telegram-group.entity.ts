import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EventEntity } from './event.entity';

@Entity({ name: 'telegram_groups' })
export class TelegramGroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_id', unique: true })
  eventId!: string;

  @Column({ name: 'group_id', length: 64 })
  groupId!: string;

  @Column({ name: 'invite_link', length: 500 })
  inviteLink!: string;

  @OneToOne(() => EventEntity, (event) => event.telegramGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;
}
