import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { AnalyzeRequestCommand } from '../../domain/commands/analyze-request.command';
import { AnalyzeRequestedEvent } from '../../domain/events/analyze-request.event';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EvaluateContextCommand } from 'src/domain/commands/evaluate-context.command';
import { ChatAskQuestionEvent } from 'src/domain/events/chat-ask-question.event';

@CommandHandler(EvaluateContextCommand)
export class EvaluateContextHandler
  implements ICommandHandler<EvaluateContextCommand>
{
  private readonly logger = new Logger(EvaluateContextHandler.name);
  private readonly chatIterations = 3;
  private iteration = 0;
  private enoughContext = false;

  constructor(
    @Inject('ASK_QUESTION_EVENT') private readonly eventBus: ClientProxy,
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
      this.eventBus.emit(ChatAskQuestionEvent.name, event);
      this.logger.log(`Published event: ${event}`);
      return event;
    }

    this.logger.log(`Evaluation completed`);

    return null;
  }
}
