import { Controller, Get, ParseIntPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('match')
export class MatchController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('groups')
  async getGroupMatches(
    @Query('userId', new ParseUUIDPipe()) userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.recommendationsService.getGroupMatches(userId, limit);
  }
}
