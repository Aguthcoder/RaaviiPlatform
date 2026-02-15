import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private readonly configService: ConfigService) {}

  async pushEventCreated(eventId: string): Promise<void> {
    await this.postToN8n('/event-created', { eventId, ts: new Date().toISOString() });
  }

  async pushRecommendationsToN8n(userId: string, recommendations: unknown[]): Promise<void> {
    await this.postToN8n('/recommendations', {
      userId,
      recommendations,
      ts: new Date().toISOString(),
    });
  }

  private async postToN8n(path: string, payload: Record<string, unknown>) {
    const webhookBase = this.configService.get<string>('N8N_WEBHOOK_URL');
    const apiKey = this.configService.get<string>('N8N_API_KEY');

    if (!webhookBase) {
      this.logger.warn('N8N_WEBHOOK_URL is not configured, skipping webhook call.');
      return;
    }

    const normalized = webhookBase.endsWith('/')
      ? webhookBase.slice(0, -1)
      : webhookBase;

    await axios.post(`${normalized}${path}`, payload, {
      timeout: 10000,
      headers: apiKey ? { 'x-ravi-api-key': apiKey } : undefined,
    });
  }
}
