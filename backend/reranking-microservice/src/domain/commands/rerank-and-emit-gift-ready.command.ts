import { Command } from "@nestjs/cqrs";

export class RerankAndEmitGiftReadyCommand extends Command<void> {
  constructor(public readonly eventId: string) {
    super();
  }
}
