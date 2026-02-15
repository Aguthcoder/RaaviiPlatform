import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@Req() req: { user: { sub: string } }) {
    const notifications = await this.notificationsService.listForUser(req.user.sub);
    const unread = notifications.filter((notification) => !notification.isRead).length;
    return { unread, items: notifications };
  }

  @Patch('read')
  markRead(@Req() req: { user: { sub: string } }, @Body() body: { ids: string[] }) {
    return this.notificationsService.markRead(req.user.sub, body.ids || []);
  }
}
