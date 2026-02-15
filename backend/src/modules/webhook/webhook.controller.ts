import { Body, Controller, Headers, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('n8n')
  fromN8n(@Headers() headers: Record<string, string | string[]>, @Body() body: unknown) {
    return this.webhookService.processN8nEvent(headers, body);
  }

  @Post('bot')
  fromBot(@Headers() headers: Record<string, string | string[]>, @Body() body: unknown) {
    return this.webhookService.processBotEvent(headers, body);
  }
}
