import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../../database/entities/booking.entity';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([PaymentEntity, BookingEntity])],
  providers: [JwtAuthGuard, PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
