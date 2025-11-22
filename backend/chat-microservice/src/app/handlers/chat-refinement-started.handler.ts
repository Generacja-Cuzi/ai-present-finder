import { ChatRefinementStartedEvent } from "@core/events";
import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";
import { ChatSession } from "src/domain/entities/chat-session.entity";
import { Repository } from "typeorm";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";

@Controller()
export class ChatRefinementStartedHandler {
  private readonly logger = new Logger(ChatRefinementStartedHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
  ) {}

  @EventPattern(ChatRefinementStartedEvent.name)
  async handle(event: ChatRefinementStartedEvent): Promise<void> {
    this.logger.log(
      `Handling refinement started for chat ${event.chatId} with ${String(event.selectedListingIds.length)} selected listings`,
    );

    // Update session to refinement phase
    const session = await this.chatSessionRepository.findOne({
      where: { chatId: event.chatId },
    });

    if (session === null) {
      throw new Error(`No session found for chat ${event.chatId}`);
    }

    // Store selected listings context and switch to refinement phase
    await this.chatSessionRepository.update(
      { chatId: event.chatId },
      {
        phase: "refinement",
        selectedListingIds: event.selectedListingIds,
        selectedListingsContext: event.selectedListings,
        refinementCount: session.refinementCount + 1,
      },
    );

    this.logger.log(
      `Session ${event.chatId} updated to refinement phase (iteration ${String(session.refinementCount + 1)})`,
    );

    // Generate first refinement question
    // The generate-question handler will use the selected listings context
    await this.commandBus.execute(
      new GenerateQuestionCommand(
        event.chatId,
        session.occasion ?? "unknown",
        [], // Start fresh conversation for refinement
      ),
    );
  }
}
