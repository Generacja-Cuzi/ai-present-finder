/* eslint-disable @darraghor/nestjs-typed/controllers-should-supply-api-tags */
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { GiftReadyEvent } from "src/domain/events/gift-ready.event";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftReadyHandler {
  private readonly logger = new Logger(GiftReadyHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(GiftReadyEvent.name)
  async handle(event: GiftReadyEvent) {
    this.logger.log(`Uzyskano gotowe pomysly na prezenty`);

    const giftIdeas = event.giftIdeas;

    this.logger.log(`Pomysly na prezenty: ${giftIdeas.join(";")}`);

    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: "gift-ready",
        data: {
          giftIdeas,
        },
      }),
    );
  }
}
