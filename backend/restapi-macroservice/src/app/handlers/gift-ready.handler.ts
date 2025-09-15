import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { GiftReadyEvent } from 'src/domain/events/gift-ready.event';
import { NotifyUserSseCommand } from 'src/domain/commands/notify-user-sse.command';
import { CommandBus } from '@nestjs/cqrs';

@Controller()
export class GiftReadyHandler {
  private readonly logger = new Logger(GiftReadyHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(GiftReadyEvent.name)
  async handle(event: GiftReadyEvent) {
    this.logger.log(`Uzyskano gotowe pomysly na prezenty`);

    const giftIdeas = event.giftIdeas;

    this.logger.log(`Pomysly na prezenty: ${giftIdeas.join('; ')}`);

    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: 'gift-ready',
        data: {
          giftIdeas,
        },
      }),
    );

    return Promise.resolve();
  }
}
