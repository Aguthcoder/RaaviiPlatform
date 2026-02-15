import { Module } from '@nestjs/common';
import { BotIntegrationController } from './bot-integration.controller';
import { BotIntegrationService } from './bot-integration.service';

@Module({
  controllers: [BotIntegrationController],
  providers: [BotIntegrationService],
  exports: [BotIntegrationService],
})
export class BotIntegrationModule {}
