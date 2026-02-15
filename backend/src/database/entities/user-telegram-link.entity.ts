import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_telegram_links' })
export class UserTelegramLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.telegramLinks)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'telegram_user_id', type: 'bigint', unique: true })
  telegramUserId!: string;

  @Column({ name: 'telegram_username', nullable: true })
  telegramUsername?: string;
}
