import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { EventEntity } from '../../database/entities/event.entity';
import { TelegramGroupMessageEntity } from '../../database/entities/telegram-group-message.entity';
import { UserTelegramLinkEntity } from '../../database/entities/user-telegram-link.entity';
import { TelegramWebhookDto } from './dto';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @InjectRepository(TelegramGroupMessageEntity)
    private readonly groupMessageRepository: Repository<TelegramGroupMessageEntity>,
    @InjectRepository(UserTelegramLinkEntity)
    private readonly userTelegramLinkRepository: Repository<UserTelegramLinkEntity>,
    private readonly configService: ConfigService,
  ) {}

  async handleGroupMessage(payload: TelegramWebhookDto): Promise<void> {
    if (!payload.message?.text || payload.message.chat.type === 'private') {
      return;
    }

    await this.groupMessageRepository.save({
      telegramChatId: String(payload.message.chat.id),
      telegramUserId: String(payload.message.from.id),
      telegramUsername: payload.message.from.username,
      messageText: payload.message.text,
    });
  }

  async getUserKeywordSignals(userId: string): Promise<string[]> {
    const linked = await this.userTelegramLinkRepository.findOne({ where: { userId } });
    if (!linked) return [];

    const messages = await this.groupMessageRepository.find({
      where: { telegramUserId: linked.telegramUserId },
      take: 100,
      order: { createdAt: 'DESC' },
    });

    const corpus = messages.map((message) => message.messageText.toLowerCase()).join(' ');
    const dictionary = [
      'برنامه نویسی',
      'هوش مصنوعی',
      'استارتاپ',
      'طراحی',
      'شبکه سازی',
      'مارکتینگ',
      'یادگیری ماشین',
      'product',
      'ai',
      'design',
    ];

    return dictionary.filter((keyword) => corpus.includes(keyword));
  }

  async sendRecommendations(userId: string, events: EventEntity[]): Promise<void> {
    const linked = await this.userTelegramLinkRepository.findOne({ where: { userId } });
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!linked || !botToken || events.length === 0) {
      return;
    }

    const message = [
      'پیشنهاد رویدادهای جدید برای شما:',
      ...events.map((event, index) => `${index + 1}. ${event.title}`),
    ].join('\n');

    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: linked.telegramUserId,
        text: message,
      },
      { timeout: 10000 },
    );

    this.logger.log(`Recommendations sent to Telegram for userId=${userId}`);
  }
}
