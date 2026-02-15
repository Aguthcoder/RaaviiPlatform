import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from 'src/database/entities/event.entity';
import { GroupMatchEntity } from 'src/database/entities/group-match.entity';
import { ProfileEntity } from 'src/database/entities/profile.entity';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, ProfileEntity, GroupMatchEntity]), HttpModule],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
