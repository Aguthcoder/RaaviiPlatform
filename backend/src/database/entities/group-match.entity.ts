import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'group_matches' })
export class GroupMatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'event_id' })
  eventId!: string;

  @Column({ type: 'float' })
  score!: number;

  @Column({ name: 'personality_score', type: 'float' })
  personalityScore!: number;

  @Column({ name: 'interests_score', type: 'float' })
  interestsScore!: number;

  @Column({ name: 'city_score', type: 'float' })
  cityScore!: number;

  @Column({ name: 'event_type_score', type: 'float' })
  eventTypeScore!: number;

  @Column({ name: 'scoring_explanation', type: 'text' })
  scoringExplanation!: string;

  @Column({ name: 'scoring_breakdown', type: 'jsonb' })
  scoringBreakdown!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
