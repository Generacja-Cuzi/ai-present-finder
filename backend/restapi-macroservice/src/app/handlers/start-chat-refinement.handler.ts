import { ChatRefinementStartedEvent } from "@core/events";
import { StartChatRefinementCommand } from "src/domain/commands/start-chat-refinement.command";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

@CommandHandler(StartChatRefinementCommand)
export class StartChatRefinementHandler
  implements ICommandHandler<StartChatRefinementCommand>
{
  private readonly logger = new Logger(StartChatRefinementHandler.name);

  constructor(
    @Inject("CHAT_REFINEMENT_STARTED_EVENT")
    private readonly eventBus: ClientProxy,
    private readonly listingRepository: IListingRepository,
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(command: StartChatRefinementCommand): Promise<void> {
    this.logger.log(
      `Starting refinement for chat ${command.chatId} with ${String(command.selectedListingIds.length)} selected listings`,
    );

    // Set status back to interview for refinement
    const chat = await this.chatRepository.findByChatId(command.chatId);
    if (chat !== null) {
      await this.chatRepository.update(chat.id, {
        isInterviewCompleted: false,
        status: "interview",
      });
      this.logger.log(
        `Set chat ${command.chatId} status to interview for refinement`,
      );
    }
    // Fetch full listing details for the selected IDs
    const selectedListings = await Promise.all(
      command.selectedListingIds.map(async (id) => {
        const listing = await this.listingRepository.findById(id);
        if (listing === null) {
          throw new Error(`Listing ${id} not found`);
        }
        return {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          provider: listing.provider,
          priceLabel: listing.priceLabel,
        };
      }),
    );

    // Emit event to chat-microservice
    const event = new ChatRefinementStartedEvent(
      command.chatId,
      command.selectedListingIds,
      selectedListings,
    );

    this.eventBus.emit(ChatRefinementStartedEvent.name, event);

    this.logger.log(
      `Emitted ChatRefinementStartedEvent for chat ${command.chatId}`,
    );
  }
}
