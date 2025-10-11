import { GiftGenerateRequestedEvent } from "@core/events";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

import { GenerateGiftIdeasCommand } from "../../domain/commands/generate-gift-ideas.command";

@Controller()
export class GiftGenerateRequestedHandler {
  private readonly logger = new Logger(GiftGenerateRequestedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(GiftGenerateRequestedEvent.name)
  async handle(event: GiftGenerateRequestedEvent) {
    this.logger.log("Handling gift generate requested event");

    const profile = event.profile?.recipient_profile ?? null;
    const keywords = [
      ...event.keywords,
      ...(event.profile?.key_themes_and_keywords ?? []),
    ];

    await this.commandBus.execute(
      new GenerateGiftIdeasCommand(profile, keywords, event.chatId),
    );
  }
}
