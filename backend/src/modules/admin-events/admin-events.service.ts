import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { CreateEventDto } from '../events/dto/create-event.dto';
import { UpdateEventDto } from '../events/dto/update-event.dto';

@Injectable()
export class AdminEventsService {
  constructor(private readonly eventsService: EventsService) {}

  create(dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  update(id: string, dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  remove(id: string) {
    return this.eventsService.remove(id);
  }

  list(page?: number, limit?: number) {
    return this.eventsService.findAll({ page, limit, onlyActive: false });
  }
}
