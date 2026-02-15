import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { MatchingService } from './matching.service';
import { RunMatchingDto } from './dto/run-matching.dto';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('run')
  @Roles('admin')
  run(@Body() dto: RunMatchingDto) {
    return this.matchingService.runMatching(dto);
  }
}
