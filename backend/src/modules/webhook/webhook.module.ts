import { Module } from '@nestjs/common';
import { MatchingModule } from '../matching/matching.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [MatchingModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
