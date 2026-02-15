import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEntity } from "./entities/event.entity";
import { CreateEventDto } from "./dto/create-event.dto";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
  ) {}

  async create(dto: CreateEventDto): Promise<EventEntity> {
    if (dto.endDate <= dto.startDate) {
      throw new BadRequestException("endDate must be after startDate");
    }

    const event = this.eventsRepository.create({
      title: dto.title,
      description: dto.description,
      startDate: dto.startDate,
      endDate: dto.endDate,
      capacity: dto.capacity,
      price: dto.price ?? 0,
      reservedCount: 0,
      isActive: true,
      tags: dto.tags,
    });

    return this.eventsRepository.save(event);
  }

  async findAll(): Promise<EventEntity[]> {
    return this.eventsRepository.find({
      where: { isActive: true },
      order: { startDate: "ASC" },
    });
  }

  async findOne(id: string): Promise<EventEntity | null> {
    return this.eventsRepository.findOne({ where: { id } });
  }
}
