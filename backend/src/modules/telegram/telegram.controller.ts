import { Body, Controller, Post } from '@nestjs/common';
import { TelegramWebhookDto } from './dto';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async ingestWebhook(@Body() payload: TelegramWebhookDto) {
    await this.telegramService.handleGroupMessage(payload);
    return { ok: true };
  }
}
