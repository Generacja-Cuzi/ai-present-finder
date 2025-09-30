import { EndInterviewCommand } from "src/domain/commands/end-interview.command";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { GiftGenerateRequestedEvent } from "src/domain/events/gift-generate-requested.event";

import { Inject, Logger } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

@CommandHandler(EndInterviewCommand)
export class EndInterviewCommandHandler
  implements ICommandHandler<EndInterviewCommand>
{
  private readonly logger = new Logger(EndInterviewCommandHandler.name);

  constructor(
    @Inject("GIFT_GENERATE_REQUESTED_EVENT")
    private readonly giftEventBus: ClientProxy,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: EndInterviewCommand) {
    await this.commandBus.execute(
      new NotifyUserSseCommand(command.context.chatId, {
        type: "chat-interview-completed",
      }),
    );

    const giftEvent = new GiftGenerateRequestedEvent(
      command.context.keywords,
      command.context.chatId,
      command.profile,
    );
    this.giftEventBus.emit(GiftGenerateRequestedEvent.name, giftEvent);

    this.logger.log(`Published event: ${JSON.stringify(giftEvent)}`);

    this.logger.log(`Evaluation completed`);

    
  }
}
