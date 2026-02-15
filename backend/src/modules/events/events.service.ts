import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from '../../database/entities/event.entity';
import { EventReservationEntity } from '../../database/entities/event-reservation.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @InjectRepository(EventReservationEntity)
    private readonly reservationRepository: Repository<EventReservationEntity>,
  ) {}

  async create(dto: CreateEventDto): Promise<EventEntity> {
    this.validateDates(dto.startDate, dto.endDate);

    const event = this.eventsRepository.create({
      ...dto,
      price: dto.price ?? 0,
      reservedCount: 0,
      isActive: dto.isActive ?? true,
    });

    return this.eventsRepository.save(event);
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.findOneOrFail(id);
    this.validateDates(dto.startDate ?? event.startDate, dto.endDate ?? event.endDate);
    Object.assign(event, dto);
    return this.eventsRepository.save(event);
  }

  async remove(id: string) {
    const event = await this.findOneOrFail(id);
    await this.eventsRepository.remove(event);
    return { id, deleted: true };
  }

  async findAll(params?: {
    city?: string;
    category?: string;
    date?: string;
    price?: 'free' | 'paid';
    page?: number;
    limit?: number;
    onlyActive?: boolean;
  }) {
    const page = Math.max(1, Number(params?.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(params?.limit ?? 12)));

    const qb = this.eventsRepository.createQueryBuilder('event');

    if (params?.onlyActive !== false) qb.andWhere('event.isActive = :isActive', { isActive: true });
    if (params?.city) qb.andWhere('event.city = :city', { city: params.city });
    if (params?.category) qb.andWhere('event.category = :category', { category: params.category });
    if (params?.price === 'free') qb.andWhere('event.price = 0');
    if (params?.price === 'paid') qb.andWhere('event.price > 0');
    if (params?.date) {
      const date = new Date(params.date);
      if (!Number.isNaN(date.getTime())) {
        qb.andWhere('DATE(event.startDate) = DATE(:date)', { date: date.toISOString() });
      }
    }

    qb.orderBy('event.startDate', 'ASC').skip((page - 1) * limit).take(limit);

    const [events, count] = await qb.getManyAndCount();

    return {
      count,
      page,
      limit,
      events,
    };
  }

  async findOne(id: string): Promise<EventEntity | null> {
    return this.eventsRepository.findOne({ where: { id } });
  }

  async findOneOrFail(id: string) {
    const event = await this.findOne(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async reserve(userId: string, payload: CreateReservationDto) {
    return this.eventsRepository.manager.transaction(async (tx) => {
      const existing = await tx.findOne(EventReservationEntity, {
        where: { eventId: payload.eventId, userId },
      });
      if (existing) {
        throw new ConflictException('You already reserved this event');
      }

      const event = await tx
        .createQueryBuilder(EventEntity, 'event')
        .setLock('pessimistic_write')
        .where('event.id = :id', { id: payload.eventId })
        .getOne();

      if (!event || !event.isActive) throw new NotFoundException('Event not found');

      const seats = payload.seats ?? 1;
      const remaining = event.capacity - event.reservedCount;
      if (remaining < seats) throw new BadRequestException('Event capacity exceeded');

      event.reservedCount += seats;
      await tx.save(EventEntity, event);

      const reservation = tx.create(EventReservationEntity, {
        eventId: event.id,
        userId,
        seats,
        paymentStatus: payload.paymentReference ? 'paid' : 'pending',
        paymentReference: payload.paymentReference,
        paidAt: payload.paymentReference ? new Date() : undefined,
      });

      const saved = await tx.save(EventReservationEntity, reservation);
      return {
        reservation: saved,
        remaining: event.capacity - event.reservedCount,
      };
    });
  }

  private validateDates(startDate?: Date, endDate?: Date) {
    if (!startDate || !endDate) return;
    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }
  }
}
