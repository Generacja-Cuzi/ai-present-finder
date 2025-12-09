import { ProductFetchedEvent, ProgressUpdateEvent } from "@core/events";

import { Controller, Inject, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";
import { ClientProxy } from "@nestjs/microservices";

import { AddProductsToSessionCommand } from "../../domain/commands/add-products-to-session.command";
import { CreateSessionCommand } from "../../domain/commands/create-session.command";
import { IncrementSessionCompletionCommand } from "../../domain/commands/increment-session-completion.command";
import { RerankAndEmitGiftReadyCommand } from "../../domain/commands/rerank-and-emit-gift-ready.command";

@Controller()
export class ProductFetchedHandler {
  private readonly logger = new Logger(ProductFetchedHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    @Inject("PROGRESS_UPDATE_EVENT")
    private readonly progressEventBus: ClientProxy,
  ) {}

  @EventPattern(ProductFetchedEvent.name)
  async handle(event: ProductFetchedEvent) {
    this.logger.log(
      `Handling ProductFetchedEvent from ${event.provider} for chat ${event.chatId}`,
    );
    const eventId = event.eventId;

    await this.commandBus.execute(
      new CreateSessionCommand(eventId, event.chatId, event.totalEvents),
    );

    await this.commandBus.execute(
      new AddProductsToSessionCommand(
        eventId,
        event.products,
        ProductFetchedEvent.name,
        event.provider,
        event.success,
      ),
    );

    const { completed, completedEvents, totalEvents } =
      await this.commandBus.execute<
        IncrementSessionCompletionCommand,
        { completed: boolean; completedEvents: number; totalEvents: number }
      >(new IncrementSessionCompletionCommand(eventId));

    // Calculate progress for fetching stage (60% - 90%)
    const fetchProgress = 60 + Math.floor((completedEvents / totalEvents) * 30);
    const progressEvent = new ProgressUpdateEvent(
      event.chatId,
      "fetching",
      fetchProgress,
      `Pobrano ${completedEvents}/${totalEvents} źródeł`,
    );
    this.progressEventBus.emit(ProgressUpdateEvent.name, progressEvent);
    this.logger.log(
      `Published ProgressUpdateEvent: fetching (${fetchProgress}%) - ${completedEvents}/${totalEvents}`,
    );

    if (completed) {
      await this.commandBus.execute(new RerankAndEmitGiftReadyCommand(eventId));
    }
  }
}
