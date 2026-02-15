import { Injectable, Optional, Inject, forwardRef } from "@nestjs/common";

import { UsersService } from "../users/users.service";
import { EventsService } from "../events/events.service";
import { TelegramService } from "../telegram/telegram.service";
import { IntegrationsService } from "../integrations/integrations.service";

@Injectable()
export class RecommendationsService {
  constructor(
    @Optional()
    @Inject(forwardRef(() => UsersService))
    private readonly usersService?: UsersService,

    @Optional()
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService?: EventsService,

    @Optional()
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService?: TelegramService,

    @Optional()
    @Inject(forwardRef(() => IntegrationsService))
    private readonly integrationsService?: IntegrationsService,
  ) {}

  // ⭐ MAIN API
  async getRecommendations(userId: number) {
    const interests = await this.safeUserInterests(userId);
    const events = await this.safeEvents();
    const telegramSignals = await this.safeTelegram(userId);

    return this.rank(events, interests, telegramSignals);
  }

  // ---------------- SAFE WRAPPERS ----------------

  private async safeUserInterests(userId: number) {
    if (!this.usersService?.getUserInterests) return [];
    try {
      return await this.usersService.getUserInterests(userId);
    } catch {
      return [];
    }
  }

  private async safeEvents() {
    if (!this.eventsService?.getUpcomingActiveEvents) return [];
    try {
      return await this.eventsService.getUpcomingActiveEvents();
    } catch {
      return [];
    }
  }

  private async safeTelegram(userId: number) {
    if (!this.telegramService?.getUserKeywordSignals) return [];
    try {
      return await this.telegramService.getUserKeywordSignals(userId);
    } catch {
      return [];
    }
  }

  // ---------------- SMART RANKING ----------------

  private rank(events: any[], interests: any[], telegramSignals: any[]) {
    if (!events?.length) return [];

    const interestSet = new Set(
      (interests ?? []).map((i: any) => String(i).toLowerCase()),
    );

    const signalSet = new Set(
      (telegramSignals ?? []).map((i: any) => String(i).toLowerCase()),
    );

    return events
      .map((event: any) => {
        let score = 0;

        const text =
          `${event?.title ?? ""} ${event?.description ?? ""} ${event?.category ?? ""}`.toLowerCase();

        interestSet.forEach((i) => {
          if (text.includes(i)) score += 3;
        });

        signalSet.forEach((s) => {
          if (text.includes(s)) score += 2;
        });

        return { event, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.event);
  }
}
