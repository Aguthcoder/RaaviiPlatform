import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntelligenceService } from './intelligence.service';
import { SmartProfile } from '../smart-profile/entities/smart-profile.entity';
import { isAdminUser } from '../admin/admin.controller';

@Controller('api/intelligence')
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  constructor(
    private readonly intelligenceService: IntelligenceService,
    @InjectRepository(SmartProfile)
    private smartProfileRepo: Repository<SmartProfile>,
  ) {}

  // ── دریافت پروفایل هوشمند کاربر جاری ──────────────────────
  @Get('my-profile')
  async getMySmartProfile(@Req() req: any) {
    const userId = req.user.id;
    const profile = await this.smartProfileRepo.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      return {
        communication_type: null,
        dominant_need: null,
        interaction_rhythm: null,
        return_rate: 0,
        no_show_count: 0,
        is_suspended: false,
        next_event_interests: [],
        ai_insights: null,
      };
    }
    return profile;
  }

  // ── بروزرسانی اولویت لوکیشن ─────────────────────────────────
  @Patch('location-preference')
  async updateLocationPreference(
    @Req() req: any,
    @Body() body: { preference: 'neighborhood' | 'city_wide'; neighborhood?: string },
  ) {
    const userId = req.user.id;
    let profile = await this.smartProfileRepo.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      profile = this.smartProfileRepo.create({ user_id: userId });
    }
    profile.location_preference = body.preference;
    if (body.neighborhood) {
      profile.preferred_neighborhood = body.neighborhood;
    }
    return await this.smartProfileRepo.save(profile);
  }

  // ── اجرای مچینگ برای یک رویداد (ادمین) ──────────────────────
  @Post('match/:eventId')
  async runMatching(@Req() req: any, @Param('eventId') eventId: string) {
    if (!isAdminUser(req.user)) throw new ForbiddenException();
    const groups = await this.intelligenceService.matchUsersForEvent(eventId);
    return {
      success: true,
      groupCount: groups.length,
      groups: groups.map((g) => ({
        groupId: g.groupId,
        memberCount: g.members.length,
        avgScore: Math.round(g.avgScore),
        members: g.members.map((m) => ({
          userId: m.userId,
          locationPreference: m.locationPreference,
        })),
      })),
    };
  }

  // ── گزارش‌گیری هوش مصنوعی (ادمین) ──────────────────────────
  @Get('stats')
  async getIntelligenceStats(@Req() req: any) {
    if (!isAdminUser(req.user)) throw new ForbiddenException();
    return await this.intelligenceService.getIntelligenceStats();
  }

  // ── لیست کاربران ساسپند (ادمین) ────────────────────────────
  @Get('suspended-users')
  async getSuspendedUsers(@Req() req: any) {
    if (!isAdminUser(req.user)) throw new ForbiddenException();
    const suspended = await this.smartProfileRepo.find({
      where: { is_suspended: true },
    });
    return { users: suspended, total: suspended.length };
  }

  // ── تأیید/رفع ساسپند کاربر (ادمین) ─────────────────────────
  @Patch('unsuspend/:userId')
  async unsuspendUser(@Req() req: any, @Param('userId') userId: string) {
    if (!isAdminUser(req.user)) throw new ForbiddenException();
    const profile = await this.smartProfileRepo.findOne({
      where: { user_id: userId },
    });
    if (!profile) throw new ForbiddenException('پروفایل یافت نشد');
    profile.is_suspended = false;
    profile.no_show_count = 0;
    profile.suspension_reason = null;
    return await this.smartProfileRepo.save(profile);
  }

  // ── بروزرسانی رفتار تلگرام (توسط bot) ──────────────────────
  @Post('telegram-behavior')
  async updateTelegramBehavior(
    @Req() req: any,
    @Body()
    body: {
      userId: string;
      messageCount: number;
      isInitiator: boolean;
      isBridge: boolean;
      avgResponseTime: number;
    },
  ) {
    // این endpoint توسط bot یا n8n فراخوانی می‌شود
    await this.intelligenceService.updateTelegramBehavior(body.userId, {
      messageCount: body.messageCount,
      isInitiator: body.isInitiator,
      isBridge: body.isBridge,
      avgResponseTime: body.avgResponseTime,
    });
    return { success: true };
  }

  // ── ثبت کلمات کلیدی نیاز (توسط bot) ─────────────────────────
  @Post('detect-needs')
  async detectNeeds(
    @Req() req: any,
    @Body() body: { userId: string; keywords: string[] },
  ) {
    await this.intelligenceService.detectUserNeedsFromKeywords(
      body.userId,
      body.keywords,
    );
    return { success: true };
  }
}
