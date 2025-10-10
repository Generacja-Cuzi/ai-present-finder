import { RecipientProfile } from "@core/types";
import { In, LessThanOrEqual, Repository } from "typeorm";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";

import {
  GiftSession,
  SessionStatus,
} from "../../domain/entities/gift-session.entity";

@Injectable()
export class EventTrackingService {
  private readonly logger = new Logger(EventTrackingService.name);
  private readonly eventTimeoutMs: number;

  constructor(
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
    private readonly configService: ConfigService,
  ) {
    this.eventTimeoutMs = Number.parseInt(
      this.configService.get<string>("EVENT_TIMEOUT_MS") ?? "120000",
      10,
    );
  }

  async createSessionIfNotExists(
    eventId: string,
    chatId: string,
    totalEvents: number,
  ): Promise<string> {
    // This will either insert a new session or do nothing if it already exists
    await this.giftSessionRepository
      .createQueryBuilder()
      .insert()
      .into(GiftSession)
      .values({
        eventId,
        chatId,
        status: SessionStatus.ACTIVE,
        completedEvents: 0,
        totalEvents,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .orIgnore() // Ignore if the record already exists
      .execute();

    this.logger.log(
      `Upserted session ${eventId} exists for chat ${chatId} with ${String(totalEvents)} events`,
    );

    return eventId;
  }

  async saveGiftContext(
    eventId: string,
    chatId: string,
    totalEvents: number,
    userProfile: RecipientProfile | null,
    keywords: string[],
  ): Promise<void> {
    const sessionId = await this.createSessionIfNotExists(
      eventId,
      chatId,
      totalEvents,
    );

    await this.giftSessionRepository.update(sessionId, {
      giftContext: {
        userProfile,
        keywords,
      },
    });

    this.logger.log(`Saved gift context for session ${eventId}`);
  }

  async incrementSessionCompletion(
    eventId: string,
  ): Promise<{ completed: boolean }> {
    return this.giftSessionRepository.manager.transaction(async (manager) => {
      await manager.increment(GiftSession, { eventId }, "completedEvents", 1);

      // Check if session is now complete
      const session = await manager.findOne(GiftSession, {
        where: { eventId },
      });

      this.logger.log(
        `Session ${eventId} completedEvents: ${session?.completedEvents.toString() ?? "---"}/${session?.totalEvents.toString() ?? "---"}`,
      );
      if (session !== null && session.completedEvents >= session.totalEvents) {
        await manager.update(
          GiftSession,
          { eventId },
          { status: SessionStatus.COMPLETED },
        );
        this.logger.log(`Session ${eventId} marked as completed`);
        return { completed: true };
      }
      return { completed: false };
    });
  }

  async markTimeoutEvents(): Promise<string[]> {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - this.eventTimeoutMs);

    const timeoutSessions = await this.giftSessionRepository.find({
      where: {
        status: SessionStatus.ACTIVE,
        updatedAt: LessThanOrEqual(twoMinutesAgo),
      },
    });

    if (timeoutSessions.length > 0) {
      // Update sessions to timeout status
      await this.giftSessionRepository.update(
        { eventId: In(timeoutSessions.map((s) => s.eventId)) },
        { status: SessionStatus.TIMEOUT },
      );

      this.logger.log(
        `Marked ${String(timeoutSessions.length)} sessions as timeout`,
      );
    }

    return timeoutSessions.map((session) => session.eventId);
  }
}
