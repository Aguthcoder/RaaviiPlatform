import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'profiles' })
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'interests', type: 'text', array: true, nullable: true })
  interests?: string[];

  @Column({ name: 'personality_type', nullable: true, length: 32 })
  personalityType?: string;

  @Column({ name: 'personality_traits', type: 'text', array: true, nullable: true })
  personalityTraits?: string[];

  @Column({ name: 'preferred_event_types', type: 'text', array: true, nullable: true })
  preferredEventTypes?: string[];

  @Column({ nullable: true })
  city?: string;

  @Column({ type: 'smallint', nullable: true })
  age?: number;

  @Column({ nullable: true, length: 32 })
  gender?: string;

  @Column({ nullable: true, length: 120 })
  education?: string;
}
