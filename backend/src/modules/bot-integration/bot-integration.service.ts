import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class BotIntegrationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
  ) {}

  async dispatchGroupInvite(userId: string, eventId: string, telegramGroupId: string): Promise<void> {
    const botWebhookSecret = this.configService.get<string>('BOT_WEBHOOK_SHARED_SECRET');
    const botServiceUrl = this.configService.get<string>('BOT_SERVICE_URL') ?? 'http://telegram-bot:8080';

    await axios.post(
      `${botServiceUrl}/internal/invite`,
      { userId, eventId, telegramGroupId },
      { headers: { 'x-ravi-bot-secret': botWebhookSecret ?? '' } },
    );

    await this.queueService.add('bot.invite.sent', { userId, eventId, telegramGroupId });
  }
}
