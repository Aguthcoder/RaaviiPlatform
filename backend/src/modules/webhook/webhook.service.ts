import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MatchingService } from '../matching/matching.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly matchingService: MatchingService,
    private readonly queueService: QueueService,
  ) {}

  async processN8nEvent(headers: Record<string, string | string[]>, body: any): Promise<{ accepted: boolean }> {
    this.assertSecret(headers, 'x-ravi-n8n-secret', 'N8N_WEBHOOK_SECRET');

    if (body?.type === 'reservation.created' || body?.type === 'event.created') {
      await this.matchingService.runMatching({
        eventId: body.eventId,
        userId: body.userId,
        trigger: body.type === 'event.created' ? 'event_created' : 'reservation_created',
      });
    }

    await this.queueService.add('webhook.audit', body);
    return { accepted: true };
  }

  async processBotEvent(headers: Record<string, string | string[]>, body: any): Promise<{ accepted: boolean }> {
    this.assertSecret(headers, 'x-ravi-bot-secret', 'BOT_WEBHOOK_SHARED_SECRET');
    await this.queueService.add('bot.webhook.event', body);
    return { accepted: true };
  }

  private assertSecret(
    headers: Record<string, string | string[]>,
    headerKey: string,
    configKey: string,
  ): void {
    const received = headers[headerKey] as string | undefined;
    const expected = this.configService.get<string>(configKey);

    if (!expected || received !== expected) {
      throw new UnauthorizedException(`Invalid ${headerKey}`);
    }
  }
}
