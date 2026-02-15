import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../../database/entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
  ) {}

  async getMyBooking(userId: string, bookingId: string) {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId, userId } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async cancelMyBooking(userId: string, bookingId: string) {
    const booking = await this.getMyBooking(userId, bookingId);
    if (booking.status === 'cancelled') throw new BadRequestException('Booking already cancelled');
    booking.status = 'cancelled';
    booking.updatedAt = new Date();
    return this.bookingRepository.save(booking);
  }
}
