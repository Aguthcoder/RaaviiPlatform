import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('date') date?: string,
    @Query('price') price?: 'free' | 'paid',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.eventsService.findAll({
      city,
      category,
      date,
      price,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      onlyActive: true,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOneOrFail(id);
  }

  @Post('reserve')
  @UseGuards(JwtAuthGuard)
  reserve(
    @Req() req: { user: { sub: string } },
    @Body() dto: CreateReservationDto,
  ) {
    return this.eventsService.reserve(req.user.sub, dto);
  }
}
