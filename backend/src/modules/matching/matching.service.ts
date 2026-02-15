import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { EventEntity } from 'src/database/entities/event.entity';
import { GroupMatchEntity } from 'src/database/entities/group-match.entity';
import { ProfileEntity } from 'src/database/entities/profile.entity';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { QueueService } from '../queue/queue.service';
import { RunMatchingDto } from './dto/run-matching.dto';

interface MatchingResult {
  userId: string;
  eventId: string;
  personalityScore: number;
  interestsScore: number;
  cityScore: number;
  eventTypeScore: number;
  finalScore: number;
  scoringExplanation: string;
  scoringBreakdown: Record<string, unknown>;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    @InjectRepository(EventEntity) private readonly eventsRepo: Repository<EventEntity>,
    @InjectRepository(ProfileEntity) private readonly profilesRepo: Repository<ProfileEntity>,
    @InjectRepository(GroupMatchEntity) private readonly matchesRepo: Repository<GroupMatchEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
  ) {}

  async runMatching(dto: RunMatchingDto): Promise<MatchingResult[]> {
    const cacheKey = `matching:${dto.eventId}:${dto.userId ?? 'all'}`;
    const cached = await this.redisService.get<MatchingResult[]>(cacheKey);
    if (cached) return cached;

    const event = await this.eventsRepo.findOneByOrFail({ id: dto.eventId });
    const users = await this.getUsersForMatch(dto.userId);

    const aiEngineUrl = this.configService.get<string>('AI_ENGINE_URL') ?? 'http://ai-engine:8001';
    const { data } = await firstValueFrom(
      this.httpService.post<{ matches: MatchingResult[] }>(`${aiEngineUrl}/match`, {
        event,
        users,
      }),
    );

    const saved = await Promise.all(data.matches.map((match) => this.upsertMatch(match)));
    await this.redisService.set(cacheKey, data.matches, 120);

    await this.queueService.add('match.action.execution', {
      trigger: dto.trigger ?? 'manual',
      eventId: dto.eventId,
      matches: saved.map((item) => ({ userId: item.userId, score: item.score })),
    });

    return data.matches;
  }

  private async getUsersForMatch(userId?: string): Promise<ProfileEntity[]> {
    if (userId) {
      return this.profilesRepo.find({ where: { userId } });
    }
    return this.profilesRepo.find();
  }

  private async upsertMatch(match: MatchingResult): Promise<GroupMatchEntity> {
    let existing = await this.matchesRepo.findOne({
      where: { userId: match.userId, eventId: match.eventId },
    });

    if (!existing) {
      existing = this.matchesRepo.create({ userId: match.userId, eventId: match.eventId } as GroupMatchEntity);
    }

    existing.score = match.finalScore;
    existing.personalityScore = match.personalityScore;
    existing.interestsScore = match.interestsScore;
    existing.cityScore = match.cityScore;
    existing.eventTypeScore = match.eventTypeScore;
    existing.scoringExplanation = match.scoringExplanation;
    existing.scoringBreakdown = match.scoringBreakdown;

    this.logger.debug(`Persisted match for user=${match.userId}, event=${match.eventId}`);
    return this.matchesRepo.save(existing);
  }
}
