import { In, LessThanOrEqual, Repository } from "typeorm";
import { ulid } from "ulid";

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
    // Check if session already exists for this eventUuid
    const existingSession = await this.giftSessionRepository.findOne({
      where: { eventId },
      select: ["sessionId"],
    });

    if (existingSession !== null) {
      return existingSession.sessionId;
    }

    // Create new session
    const sessionId = ulid();
    const session = this.giftSessionRepository.create({
      sessionId,
      chatId,
      eventId,
      status: SessionStatus.ACTIVE,
      completedEvents: 0,
      totalEvents,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.giftSessionRepository.save(session);
    this.logger.log(
      `Created session ${sessionId} for chat ${chatId} with ${String(totalEvents)} events`,
    );

    return sessionId;
  }

  async incrementSessionCompletion(
    sessionId: string,
  ): Promise<{ completed: boolean }> {
    return this.giftSessionRepository.manager.transaction(async (manager) => {
      await manager.increment(GiftSession, { sessionId }, "completedEvents", 1);

      // Check if session is now complete
      const session = await manager.findOne(GiftSession, {
        where: { sessionId },
      });

      this.logger.log(
        `Session ${sessionId} completedEvents: ${session?.completedEvents.toString() ?? "---"}/${session?.totalEvents.toString() ?? "---"}`,
      );
      if (session !== null && session.completedEvents >= session.totalEvents) {
        await manager.update(
          GiftSession,
          { sessionId },
          { status: SessionStatus.COMPLETED },
        );
        this.logger.log(`Session ${sessionId} marked as completed`);
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
        { sessionId: In(timeoutSessions.map((s) => s.sessionId)) },
        { status: SessionStatus.TIMEOUT },
      );

      this.logger.log(
        `Marked ${String(timeoutSessions.length)} sessions as timeout`,
      );
    }

    return timeoutSessions.map((session) => session.sessionId);
  }
}
