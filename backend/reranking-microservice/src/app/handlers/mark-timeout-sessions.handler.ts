import { In, LessThanOrEqual, Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { MarkTimeoutSessionsCommand } from "../../domain/commands/mark-timeout-sessions.command";
import {
  GiftSession,
  SessionStatus,
} from "../../domain/entities/gift-session.entity";

@CommandHandler(MarkTimeoutSessionsCommand)
export class MarkTimeoutSessionsHandler
  implements ICommandHandler<MarkTimeoutSessionsCommand, string[]>
{
  private readonly logger = new Logger(MarkTimeoutSessionsHandler.name);
  private readonly eventTimeoutMs: number;

  constructor(
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
    private readonly configService: ConfigService,
  ) {
    const configValue =
      this.configService.get<string>("EVENT_TIMEOUT_MS") ?? "120000";
    this.eventTimeoutMs = Number.parseInt(configValue, 10);
    if (Number.isNaN(this.eventTimeoutMs)) {
      this.logger.error(
        `Invalid EVENT_TIMEOUT_MS value: ${configValue}, using default 120000`,
      );
      this.eventTimeoutMs = 120_000;
    }
  }

  async execute(_command: MarkTimeoutSessionsCommand): Promise<string[]> {
    const now = new Date();
    const timeoutThreshold = new Date(now.getTime() - this.eventTimeoutMs);

    const timeoutSessions = await this.giftSessionRepository.find({
      where: {
        status: SessionStatus.ACTIVE,
        updatedAt: LessThanOrEqual(timeoutThreshold),
      },
    });

    if (timeoutSessions.length > 0) {
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
