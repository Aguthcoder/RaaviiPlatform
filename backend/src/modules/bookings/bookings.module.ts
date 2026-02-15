import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../../database/entities/booking.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([BookingEntity])],
  controllers: [BookingsController],
  providers: [JwtAuthGuard, BookingsService],
})
export class BookingsModule {}
