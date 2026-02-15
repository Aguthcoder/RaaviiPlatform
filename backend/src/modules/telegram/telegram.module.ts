import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramGroupMessageEntity } from '../../database/entities/telegram-group-message.entity';
import { UserTelegramLinkEntity } from '../../database/entities/user-telegram-link.entity';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([TelegramGroupMessageEntity, UserTelegramLinkEntity]),
  ],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
