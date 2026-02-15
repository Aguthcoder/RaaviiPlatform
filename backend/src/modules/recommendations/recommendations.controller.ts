import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get(':userId')
  async getRecommendations(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('sendToTelegram') sendToTelegram = 'false',
  ) {
    const recommendations = await this.recommendationsService.generateForUser(
      userId,
      sendToTelegram === 'true',
    );

    return {
      userId,
      count: recommendations.length,
      recommendations,
    };
  }
}
