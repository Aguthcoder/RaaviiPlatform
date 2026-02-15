import { Body, Controller, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { IntegrationsService } from './integrations.service';

class N8nEventTriggerDto {
  @IsString()
  eventId!: string;
}

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('n8n/event-created')
  async notifyN8nEventCreated(@Body() dto: N8nEventTriggerDto) {
    await this.integrationsService.pushEventCreated(dto.eventId);
    return { ok: true };
  }
}
