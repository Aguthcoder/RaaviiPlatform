import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminEventsService } from './admin-events.service';
import { CreateEventDto } from '../events/dto/create-event.dto';
import { UpdateEventDto } from '../events/dto/update-event.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('admin/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminEventsController {
  constructor(private readonly adminEventsService: AdminEventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.adminEventsService.create(dto);
  }

  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminEventsService.list(page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.adminEventsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminEventsService.remove(id);
  }
}
