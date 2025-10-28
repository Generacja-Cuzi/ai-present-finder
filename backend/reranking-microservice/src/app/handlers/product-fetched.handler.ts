import { ProductFetchedEvent } from "@core/events";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

import { AddProductsToSessionCommand } from "../../domain/commands/add-products-to-session.command";
import { CreateSessionCommand } from "../../domain/commands/create-session.command";
import { IncrementSessionCompletionCommand } from "../../domain/commands/increment-session-completion.command";
import { RerankAndEmitGiftReadyCommand } from "../../domain/commands/rerank-and-emit-gift-ready.command";

@Controller()
export class ProductFetchedHandler {
  private readonly logger = new Logger(ProductFetchedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

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

    const { completed } = await this.commandBus.execute<
      IncrementSessionCompletionCommand,
      { completed: boolean }
    >(new IncrementSessionCompletionCommand(eventId));

    if (completed) {
      await this.commandBus.execute(new RerankAndEmitGiftReadyCommand(eventId));
    }
  }
}
