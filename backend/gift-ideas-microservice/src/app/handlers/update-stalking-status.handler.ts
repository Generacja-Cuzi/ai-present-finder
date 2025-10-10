import { UpdateStalkingStatusCommand } from "src/domain/commands/update-stalking-status.command";
import {
  ChatSession,
  SessionStatus,
} from "src/domain/entities/chat-session.entity";
import { DataSource } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { GenerateGiftIdeasCommand } from "../../domain/commands/generate-gift-ideas.command";

@CommandHandler(UpdateStalkingStatusCommand)
export class UpdateStalkingStatusHandler
  implements ICommandHandler<UpdateStalkingStatusCommand>
{
  private readonly logger = new Logger(UpdateStalkingStatusHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: UpdateStalkingStatusCommand): Promise<void> {
    const { chatId, keywords } = command;

    // Use transaction with SERIALIZABLE isolation to prevent race conditions
    await this.dataSource.transaction("SERIALIZABLE", async (entityManager) => {
      const sessionRepo = entityManager.getRepository(ChatSession);

      // Use INSERT ... ON CONFLICT to safely create session if it doesn't exist
      // This prevents race condition when both handlers try to create simultaneously
      await entityManager.query(
        `INSERT INTO chat_sessions (
          chat_id, 
          stalking_status, 
          interview_status, 
          gift_generation_triggered,
          created_at, 
          updated_at
        )
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (chat_id) DO NOTHING`,
        [chatId, SessionStatus.IN_PROGRESS, SessionStatus.IN_PROGRESS, false],
      );

      // Now lock and fetch the session (guaranteed to exist)
      const session = await sessionRepo.findOne({
        where: { chatId },
        lock: { mode: "pessimistic_write" },
      });

      if (session === null) {
        // This should never happen after INSERT ... ON CONFLICT
        throw new Error(`Session ${chatId} not found after creation attempt`);
      }

      // Update stalking status
      session.stalkingStatus = SessionStatus.COMPLETED;
      session.stalkingKeywords = keywords;
      session.updatedAt = new Date();
      await sessionRepo.save(session);

      this.logger.log(
        `Updated stalking status for session ${chatId} to COMPLETED`,
      );

      // Check if both are complete and gift generation hasn't been triggered yet
      if (
        session.interviewStatus === SessionStatus.COMPLETED &&
        !session.giftGenerationTriggered
      ) {
        this.logger.log(
          `Both stalking and interview completed for session ${chatId}. Triggering gift generation.`,
        );

        // Mark gift generation as triggered to prevent duplicate execution
        session.giftGenerationTriggered = true;
        await sessionRepo.save(session);

        const finalKeywords = session.stalkingKeywords ?? [];
        const profile = session.interviewProfile ?? null;

        // Trigger gift generation after transaction commits
        // Using setImmediate ensures transaction completes first
        setImmediate(() => {
          this.commandBus
            .execute(
              new GenerateGiftIdeasCommand(profile, finalKeywords, chatId),
            )
            .catch((error: unknown) => {
              this.logger.error(
                `Failed to execute gift generation for session ${chatId}`,
                error instanceof Error ? error.stack : String(error),
              );
            });
        });
      } else {
        this.logger.log(
          `Waiting for completion. Stalking: ${session.stalkingStatus}, Interview: ${session.interviewStatus}, Gift triggered: ${String(session.giftGenerationTriggered)}`,
        );
      }
    });
  }
}
