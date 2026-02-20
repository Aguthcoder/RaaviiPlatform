import {
  Controller, Post, Get, Body, Param, Query,
  UseGuards, Req, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchingService } from './matching.service';
import { SmartProfile } from '../smart-profile/smart-profile.entity';
import { isAdminUser } from '../admin/admin.controller';

@Controller('api/matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
    @InjectRepository(SmartProfile)
    private readonly smartProfileRepo: Repository<SmartProfile>,
  ) {}

  /**
   * اجرای الگوریتم گروه‌بندی برای یک رویداد (فقط ادمین)
   */
  @Post('create-groups/:eventId')
  async createGroups(
    @Param('eventId') eventId: string,
    @Body() body: {
      userIds: string[];
      groupSize?: number;
      eventType?: string;
    },
    @Req() req: any,
  ) {
    if (!isAdminUser(req.user)) throw new ForbiddenException('دسترسی ادمین لازم است');
    
    const groups = await this.matchingService.createSmartGroups(
      eventId,
      body.userIds,
      body.groupSize || 5,
      body.eventType || 'mixed',
    );

    return {
      success: true,
      eventId,
      totalGroups: groups.length,
      totalMatched: groups.reduce((sum, g) => sum + g.memberIds.length, 0),
      groups,
    };
  }

  /**
   * به‌روزرسانی پروفایل بعد از رویداد
   */
  @Post('update-profile/:userId/event/:eventId')
  async updateProfileAfterEvent(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
    @Body() body: {
      attended: boolean;
      satisfactionScore?: number;
      telegramMessageCount?: number;
    },
    @Req() req: any,
  ) {
    if (!isAdminUser(req.user)) throw new ForbiddenException('دسترسی ادمین لازم است');

    await this.matchingService.updateSmartProfileAfterEvent(
      userId,
      eventId,
      body.attended,
      body.satisfactionScore ?? null,
      body.telegramMessageCount !== undefined
        ? { messageCount: body.telegramMessageCount, responseTimeMinutes: 0 }
        : undefined,
    );

    return { success: true, userId, eventId };
  }

  /**
   * پروفایل هوشمند کاربر جاری
   */
  @Get('my-profile')
  async getMySmartProfile(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    const profile = await this.smartProfileRepo.findOne({ where: { user_id: userId } });
    
    if (!profile) {
      return {
        userId,
        communication_type: null,
        dominant_need: null,
        interaction_rhythm: null,
        return_rate: 0,
        total_events_attended: 0,
        smart_score: 0,
        is_suspended: false,
      };
    }

    return profile;
  }

  /**
   * آمار رفتاری (ادمین)
   */
  @Get('behavior-patterns')
  async getBehaviorPatterns(@Req() req: any) {
    if (!isAdminUser(req.user)) throw new ForbiddenException('دسترسی ادمین لازم است');
    return this.matchingService.getBehaviorPatterns();
  }

  /**
   * کاربران غیرفعال (ادمین)
   */
  @Get('inactive-users')
  async getInactiveUsers(
    @Query('days') days: string,
    @Req() req: any,
  ) {
    if (!isAdminUser(req.user)) throw new ForbiddenException('دسترسی ادمین لازم است');
    const userIds = await this.matchingService.findInactiveUsers(parseInt(days) || 14);
    return { count: userIds.length, userIds };
  }

  /**
   * رفع ساسپند کاربر (ادمین)
   */
  @Post('unsuspend/:userId')
  async unsuspendUser(@Param('userId') userId: string, @Req() req: any) {
    if (!isAdminUser(req.user)) throw new ForbiddenException('دسترسی ادمین لازم است');

    const profile = await this.smartProfileRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new ForbiddenException('پروفایل یافت نشد');

    profile.is_suspended = false;
    profile.suspension_approved_by_admin = true;
    profile.no_show_count = 0;
    await this.smartProfileRepo.save(profile);

    return { success: true, message: 'کاربر از حالت ساسپند خارج شد' };
  }

  /**
   * لیست کاربران ساسپندشده (ادمین)
   */
  @Get('suspended-users')
  async getSuspendedUsers(@Req() req: any) {
    if (!isAdminUser(req.user)) throw new ForbiddenException('دسترسی ادمین لازم است');

    const suspended = await this.smartProfileRepo.find({
      where: { is_suspended: true },
      relations: ['user'],
    });

    return suspended.map(p => ({
      userId: p.user_id,
      suspendedAt: p.suspended_at,
      reason: p.suspension_reason,
      noShowCount: p.no_show_count,
    }));
  }
}
