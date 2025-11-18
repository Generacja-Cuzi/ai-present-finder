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
  interview_keywords: string[] | null;
  stalking_keywords: string[] | null;
  min_price: number | null;
  max_price: number | null;
  gift_generation_triggered: boolean;
  both_complete: boolean;
  save_profile?: boolean | null;
  profile_name?: string | null;
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
    const { chatId, profile, keyThemes, saveProfile, profileName } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the row to prevent concurrent updates from racing
      await queryRunner.query(
        `
        SELECT chat_id FROM chat_sessions 
        WHERE chat_id = $1 
        FOR UPDATE
        `,
        [chatId],
      );

      // Perform the upsert with conditional gift_generation_triggered flip
      const result = (await queryRunner.query(
        `
        WITH upsert AS (
          INSERT INTO chat_sessions (
            chat_id, 
            stalking_status, 
            interview_status, 
            gift_generation_triggered,
            interview_profile,
            interview_keywords,
            save_profile,
            profile_name,
            created_at, 
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, NOW(), NOW())
          ON CONFLICT (chat_id) DO UPDATE SET
            interview_status = $3,
            interview_profile = $5::jsonb,
            interview_keywords = $6::jsonb,
            save_profile = $7,
            profile_name = $8,
            gift_generation_triggered = CASE
              WHEN chat_sessions.stalking_status::text = $3::text
                   AND NOT chat_sessions.gift_generation_triggered
              THEN true
              ELSE chat_sessions.gift_generation_triggered
            END,
            updated_at = NOW()
          RETURNING 
            chat_id,
            interview_profile,
            interview_keywords,
            stalking_keywords,
            save_profile,
            profile_name,
            min_price,
            max_price,
            gift_generation_triggered,
            stalking_status::text = $3::text as both_complete
        )
        SELECT * FROM upsert WHERE both_complete AND gift_generation_triggered
        `,
        [
          chatId,
          SessionStatus.IN_PROGRESS,
          SessionStatus.COMPLETED,
          false,
          profile === null ? null : JSON.stringify(profile),
          JSON.stringify(keyThemes),
          saveProfile,
          profileName,
        ],
      )) as UpsertResult[];

      await queryRunner.commitTransaction();

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
              row.stalking_keywords ?? [],
              row.interview_keywords ?? [],
              chatId,
              row.min_price,
              row.max_price,
              row.save_profile ?? undefined,
              row.profile_name ?? undefined,
            ),
          );
        } catch (error: unknown) {
          this.logger.error(
            `Failed to execute gift generation for session ${chatId}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      } else {
        this.logger.log(
          `Waiting for stalking completion for session ${chatId}`,
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Transaction failed for session ${chatId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
