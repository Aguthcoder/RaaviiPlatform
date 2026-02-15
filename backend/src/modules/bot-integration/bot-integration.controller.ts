import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { BotIntegrationService } from './bot-integration.service';

@Controller('bot-integration')
@UseGuards(JwtAuthGuard)
export class BotIntegrationController {
  constructor(private readonly botIntegrationService: BotIntegrationService) {}

  @Post('invite')
  @Roles('admin')
  async inviteUserToGroup(
    @Body() body: { userId: string; eventId: string; telegramGroupId: string },
  ): Promise<{ status: string }> {
    await this.botIntegrationService.dispatchGroupInvite(body.userId, body.eventId, body.telegramGroupId);
    return { status: 'queued' };
  }
}
