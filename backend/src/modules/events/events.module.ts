import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventEntity } from '../../database/entities/event.entity';
import { EventsService } from './events.service';
import { EventReservationEntity } from '../../database/entities/event-reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventReservationEntity])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
