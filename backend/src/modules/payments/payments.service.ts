import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../../database/entities/booking.entity';
import { PaymentEntity } from '../../database/entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
  ) {}

  async createPayment(userId: string, input: { bookingId: string; amount: string; paymentMethod: string; gatewayTransactionId?: string }) {
    const booking = await this.bookingRepository.findOne({ where: { id: input.bookingId, userId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.paymentStatus === 'paid') throw new BadRequestException('Booking is already paid');

    const payment = await this.paymentRepository.save(
      this.paymentRepository.create({
        bookingId: booking.id,
        userId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        status: 'completed',
        gatewayTransactionId: input.gatewayTransactionId,
        paidAt: new Date(),
      }),
    );

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentId = payment.id;
    booking.amountPaid = input.amount;
    booking.confirmedAt = new Date();
    await this.bookingRepository.save(booking);

    return payment;
  }

  listMyPayments(userId: string) {
    return this.paymentRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
