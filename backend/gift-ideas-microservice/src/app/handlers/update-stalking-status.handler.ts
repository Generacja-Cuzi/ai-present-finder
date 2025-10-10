import { RecipientProfile } from "@core/types";
import { UpdateStalkingStatusCommand } from "src/domain/commands/update-stalking-status.command";
import { SessionStatus } from "src/domain/entities/chat-session.entity";
import { DataSource } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { GenerateGiftIdeasCommand } from "../../domain/commands/generate-gift-ideas.command";

interface UpsertResult {
  chat_id: string;
  interview_profile: RecipientProfile | null;
  stalking_keywords: string[];
  gift_generation_triggered: boolean;
  both_complete: boolean;
}

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

    // Single atomic UPDATE that creates session if needed and conditionally triggers generation
    const result = await this.dataSource.query<UpsertResult[]>(
      `
      WITH upsert AS (
        INSERT INTO chat_sessions (
          chat_id, 
          stalking_status, 
          interview_status, 
          gift_generation_triggered,
          stalking_keywords,
          created_at, 
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (chat_id) DO UPDATE SET
          stalking_status = $2,
          stalking_keywords = $5,
          gift_generation_triggered = CASE
            WHEN chat_sessions.interview_status = $2 
                 AND NOT chat_sessions.gift_generation_triggered
            THEN true
            ELSE chat_sessions.gift_generation_triggered
          END,
          updated_at = NOW()
        RETURNING 
          chat_id,
          interview_profile,
          stalking_keywords,
          gift_generation_triggered,
          interview_status = $2 as both_complete
      )
      SELECT * FROM upsert WHERE both_complete AND gift_generation_triggered
      `,
      [
        chatId,
        SessionStatus.COMPLETED,
        SessionStatus.IN_PROGRESS,
        false,
        keywords,
      ],
    );

    this.logger.log(
      `Updated stalking status for session ${chatId} to COMPLETED`,
    );

    // If the query returned a row, it means we triggered gift generation
    if (result.length > 0) {
      const row = result[0];

      this.logger.log(
        `Both stalking and interview completed for session ${chatId}. Triggering gift generation.`,
      );

      try {
        await this.commandBus.execute(
          new GenerateGiftIdeasCommand(
            row.interview_profile,
            row.stalking_keywords,
            chatId,
          ),
        );
      } catch (error: unknown) {
        this.logger.error(
          `Failed to execute gift generation for session ${chatId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    } else {
      this.logger.log(`Waiting for interview completion for session ${chatId}`);
    }
  }
}
