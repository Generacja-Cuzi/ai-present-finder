import { LessThanOrEqual, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";

import {
  EventStatus,
  GiftEvent,
  ServiceType,
} from "../../domain/entities/gift-event.entity";
import {
  GiftSession,
  SessionStatus,
} from "../../domain/entities/gift-session.entity";

@Injectable()
export class EventTrackingService {
  private readonly logger = new Logger(EventTrackingService.name);
  private readonly eventTimeoutMs: number;

  constructor(
    @InjectRepository(GiftEvent)
    private readonly giftEventRepository: Repository<GiftEvent>,
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
    private readonly configService: ConfigService,
  ) {
    this.eventTimeoutMs = Number.parseInt(
      this.configService.get<string>("EVENT_TIMEOUT_MS") ?? "120000",
      10,
    );
  }

  async createSession(
    sessionId: string,
    chatId: string,
    totalEvents: number,
  ): Promise<GiftSession> {
    const session = this.giftSessionRepository.create({
      sessionId,
      chatId,
      status: SessionStatus.ACTIVE,
      completedEvents: 0,
      totalEvents,
    });

    const savedSession = await this.giftSessionRepository.save(session);
    this.logger.log(
      `Created session ${sessionId} for chat ${chatId} with ${totalEvents.toString()} events`,
    );
    return savedSession;
  }

  async createEventSession(
    sessionId: string,
    services: ServiceType[],
  ): Promise<GiftEvent[]> {
    const events: GiftEvent[] = [];
    const timeoutAt = new Date(Date.now() + this.eventTimeoutMs);

    for (const serviceType of services) {
      const eventUuid = uuidv4();
      const event = this.giftEventRepository.create({
        sessionId,
        serviceType,
        eventUuid,
        status: EventStatus.PENDING,
        sentAt: new Date(),
        timeoutAt,
      });

      const savedEvent = await this.giftEventRepository.save(event);
      events.push(savedEvent);

      this.logger.log(
        `Created event ${eventUuid} for service ${serviceType} in session ${sessionId}`,
      );
    }

    return events;
  }

  async markEventCompleted(eventUuid: string): Promise<boolean> {
    const result = await this.giftEventRepository.update(
      { eventUuid, status: EventStatus.PENDING },
      {
        status: EventStatus.COMPLETED,
        receivedAt: new Date(),
      },
    );

    if ((result.affected ?? 0) > 0) {
      this.logger.log(`Event ${eventUuid} marked as completed`);

      // Update session completion count
      const event = await this.giftEventRepository.findOne({
        where: { eventUuid },
      });
      if (event !== null) {
        await this.incrementSessionCompletion(event.sessionId);
      }

      return true;
    }

    this.logger.warn(`Event ${eventUuid} not found or already processed`);
    return false;
  }

  async incrementSessionCompletion(sessionId: string): Promise<void> {
    await this.giftSessionRepository.increment(
      { sessionId, status: SessionStatus.ACTIVE },
      "completedEvents",
      1,
    );

    // Check if session is now complete
    const session = await this.giftSessionRepository.findOne({
      where: { sessionId },
    });
    if (session !== null && session.completedEvents >= session.totalEvents) {
      await this.giftSessionRepository.update(
        { sessionId },
        { status: SessionStatus.COMPLETED },
      );
      this.logger.log(`Session ${sessionId} marked as completed`);
    }
  }

  async getActiveSessionsOlderThan(minutes: number): Promise<GiftSession[]> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return this.giftSessionRepository.find({
      where: {
        status: SessionStatus.ACTIVE,
        createdAt: LessThanOrEqual(cutoffTime),
      },
    });
  }

  async markSessionTimeout(sessionId: string): Promise<void> {
    await this.giftSessionRepository.update(
      { sessionId },
      { status: SessionStatus.COMPLETED },
    );
    this.logger.log(`Session ${sessionId} marked as timeout`);
  }

  async getSessionIdByEventUuid(eventUuid: string): Promise<string | null> {
    const event = await this.giftEventRepository.findOne({
      where: { eventUuid },
      select: ["sessionId"],
    });
    return event?.sessionId ?? null;
  }

  async getSessionStatus(sessionId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    timedOut: number;
    allCompleted: boolean;
  }> {
    const events = await this.giftEventRepository.find({
      where: { sessionId },
    });

    const total = events.length;
    const completed = events.filter(
      (event) => event.status === EventStatus.COMPLETED,
    ).length;
    const pending = events.filter(
      (event) => event.status === EventStatus.PENDING,
    ).length;
    const timedOut = events.filter(
      (event) => event.status === EventStatus.TIMEOUT,
    ).length;

    return {
      total,
      completed,
      pending,
      timedOut,
      allCompleted: completed === total,
    };
  }

  async markTimeoutEvents(): Promise<string[]> {
    const now = new Date();

    // First get sessions that have pending events about to timeout
    const pendingEvents = await this.giftEventRepository.find({
      where: {
        status: EventStatus.PENDING,
        timeoutAt: LessThanOrEqual(now),
      },
    });

    // Group by sessionId to track which sessions will be completed after timeout
    const sessionIds = new Set<string>();
    for (const event of pendingEvents) {
      sessionIds.add(event.sessionId);
    }

    // Mark events as timeout
    const result = await this.giftEventRepository.update(
      {
        status: EventStatus.PENDING,
        timeoutAt: LessThanOrEqual(now),
      },
      {
        status: EventStatus.TIMEOUT,
      },
    );

    if ((result.affected ?? 0) > 0) {
      this.logger.log(`Marked ${String(result.affected)} events as timed out`);
    }

    // Return sessionIds that might now be complete (for external handling)
    return [...sessionIds];
  }

  async getPendingEventsBySession(sessionId: string): Promise<GiftEvent[]> {
    return this.giftEventRepository.find({
      where: {
        sessionId,
        status: EventStatus.PENDING,
      },
    });
  }

  async getAllPendingEvents(): Promise<GiftEvent[]> {
    return this.giftEventRepository.find({
      where: {
        status: EventStatus.PENDING,
      },
    });
  }

  async checkAndEmitCompletedSession(sessionId: string): Promise<boolean> {
    const sessionStatus = await this.getSessionStatus(sessionId);
    return sessionStatus.pending === 0;
  }

  async getSessionBySessionId(sessionId: string): Promise<GiftSession | null> {
    return this.giftSessionRepository.findOne({ where: { sessionId } });
  }
}
