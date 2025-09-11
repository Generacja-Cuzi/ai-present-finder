import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { StalkingAnalyzeRequestCommand } from '../../domain/commands/stalking-analyze-request.command';
import { StalkingAnalyzeRequestedEvent } from '../../domain/events/stalking-analyze-request.event';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EvaluateContextCommand } from 'src/domain/commands/evaluate-context.command';
import { ChatAskQuestionEvent } from 'src/domain/events/chat-ask-question.event';
import { GiftGenerateRequestedEvent } from 'src/domain/events/gift-generate-requested.event';

@CommandHandler(EvaluateContextCommand)
export class EvaluateContextHandler
  implements ICommandHandler<EvaluateContextCommand>
{
  private readonly logger = new Logger(EvaluateContextHandler.name);
  private readonly chatIterations = 3;
  private iteration = 0;
  private enoughContext = false;

  constructor(
    @Inject('CHAT_ASK_QUESTION_EVENT')
    private readonly chatEventBus: ClientProxy,
    @Inject('GIFT_GENERATE_REQUESTED_EVENT')
    private readonly giftEventBus: ClientProxy,
  ) {}

  async execute(command: EvaluateContextCommand) {
    const { context } = command;

    const history = command.history || [];

    this.iteration++;

    if (this.iteration == this.chatIterations) {
      this.enoughContext = true;
    }

    if (!this.enoughContext) {
      const event = new ChatAskQuestionEvent(context, history);
      this.chatEventBus.emit(ChatAskQuestionEvent.name, event);
      this.logger.log(`Published event: ${event}`);
      return event;
    }

    const { keywords } = context;

    const giftEvent = new GiftGenerateRequestedEvent(keywords);
    this.giftEventBus.emit(GiftGenerateRequestedEvent.name, giftEvent);

    this.logger.log(`Published event: ${giftEvent}`);

    this.logger.log(`Evaluation completed`);

    return null;
  }
}
