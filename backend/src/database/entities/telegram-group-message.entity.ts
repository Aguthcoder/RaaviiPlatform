import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'telegram_group_messages' })
export class TelegramGroupMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'telegram_chat_id', type: 'bigint' })
  telegramChatId!: string;

  @Column({ name: 'telegram_user_id', type: 'bigint' })
  telegramUserId!: string;

  @Column({ name: 'telegram_username', nullable: true })
  telegramUsername?: string;

  @Column({ name: 'message_text', type: 'text' })
  messageText!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
