import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsService } from './bookings.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get(':id')
  getOne(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.bookingsService.getMyBooking(req.user.sub, id);
  }

  @Patch(':id')
  updateStatus(
    @Req() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() body: UpdateBookingStatusDto,
  ) {
    if (body.status === 'cancelled') return this.bookingsService.cancelMyBooking(req.user.sub, id);
    return this.bookingsService.getMyBooking(req.user.sub, id);
  }
}
