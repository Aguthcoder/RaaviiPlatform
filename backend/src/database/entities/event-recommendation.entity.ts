import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'event_recommendations' })
export class EventRecommendationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'event_id' })
  eventId!: string;

  @Column({ name: 'recommendation_source' })
  recommendationSource!: 'dashboard' | 'telegram' | 'hybrid';

  @Column({ type: 'float' })
  score!: number;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'is_sent_to_telegram', default: false })
  isSentToTelegram!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
