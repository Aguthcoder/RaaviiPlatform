import { Module } from '@nestjs/common';
import { AdminEventsController } from './admin-events.controller';
import { AdminEventsService } from './admin-events.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [AdminEventsController],
  providers: [AdminEventsService],
})
export class AdminEventsModule {}
