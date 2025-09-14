import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EvaluateContextCommand } from 'src/domain/commands/evaluate-context.command';
import { ChatStartInterviewEvent } from 'src/domain/events/chat-start-interview.event';
import { GiftGenerateRequestedEvent } from 'src/domain/events/gift-generate-requested.event';

@CommandHandler(EvaluateContextCommand)
export class EvaluateContextHandler
  implements ICommandHandler<EvaluateContextCommand>
{
  private readonly logger = new Logger(EvaluateContextHandler.name);

  constructor(
    @Inject('CHAT_START_INTERVIEW_EVENT')
    private readonly chatEventBus: ClientProxy,
    @Inject('GIFT_GENERATE_REQUESTED_EVENT')
    private readonly giftEventBus: ClientProxy,
  ) {}

  async execute(command: EvaluateContextCommand) {
    const { context } = command;

    const history = command.messages ?? [];

    const enoughContext = false; // TODO(simon-the-sharp): Implement this

    if (!enoughContext) {
      const event = new ChatStartInterviewEvent(context, history);
      this.chatEventBus.emit(ChatStartInterviewEvent.name, event);
      this.logger.log(`Published event: ${JSON.stringify(event)}`);
      return Promise.resolve();
    }

    const { keywords } = context;

    const giftEvent = new GiftGenerateRequestedEvent(keywords, context.chatId);
    this.giftEventBus.emit(GiftGenerateRequestedEvent.name, giftEvent);

    this.logger.log(`Published event: ${JSON.stringify(giftEvent)}`);

    this.logger.log(`Evaluation completed`);

    return Promise.resolve();
  }
}
