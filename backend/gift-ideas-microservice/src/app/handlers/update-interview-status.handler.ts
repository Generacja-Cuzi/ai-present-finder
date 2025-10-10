import { RecipientProfile } from "@core/types";
import { UpdateInterviewStatusCommand } from "src/domain/commands/update-interview-status.command";
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

@CommandHandler(UpdateInterviewStatusCommand)
export class UpdateInterviewStatusHandler
  implements ICommandHandler<UpdateInterviewStatusCommand>
{
  private readonly logger = new Logger(UpdateInterviewStatusHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: UpdateInterviewStatusCommand): Promise<void> {
    const { chatId, profile } = command;

    // Single atomic UPDATE that creates session if needed and conditionally triggers generation
    const result = await this.dataSource.query<UpsertResult[]>(
      `
      WITH upsert AS (
        INSERT INTO chat_sessions (
          chat_id, 
          stalking_status, 
          interview_status, 
          gift_generation_triggered,
          interview_profile,
          created_at, 
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (chat_id) DO UPDATE SET
          interview_status = $3,
          interview_profile = $5,
          gift_generation_triggered = CASE
            WHEN chat_sessions.stalking_status = $3 
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
          stalking_status = $3 as both_complete
      )
      SELECT * FROM upsert WHERE both_complete AND gift_generation_triggered
      `,
      [
        chatId,
        SessionStatus.IN_PROGRESS,
        SessionStatus.COMPLETED,
        false,
        profile,
      ],
    );

    this.logger.log(
      `Updated interview status for session ${chatId} to COMPLETED`,
    );

    // If the query returned a row, it means we triggered gift generation
    if (result.length > 0) {
      const row = result[0];

      this.logger.log(
        `Both stalking and interview completed for session ${chatId}. Triggering gift generation.`,
      );

      // Guard against null interview_profile
      if (row.interview_profile === null) {
        this.logger.error(
          `Cannot generate gift ideas for session ${chatId}: interview_profile is null`,
        );
        return;
      }

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
      this.logger.log(`Waiting for stalking completion for session ${chatId}`);
    }
  }
}
