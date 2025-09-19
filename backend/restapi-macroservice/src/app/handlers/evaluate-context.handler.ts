import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EvaluateContextCommand } from 'src/domain/commands/evaluate-context.command';
import { ChatStartInterviewEvent } from 'src/domain/events/chat-start-interview.event';
import { EndInterviewCommand } from 'src/domain/commands/end-interview.command';

@CommandHandler(EvaluateContextCommand)
export class EvaluateContextHandler
  implements ICommandHandler<EvaluateContextCommand>
{
  private readonly logger = new Logger(EvaluateContextHandler.name);

  constructor(
    @Inject('CHAT_START_INTERVIEW_EVENT')
    private readonly chatEventBus: ClientProxy,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: EvaluateContextCommand) {
    const { context } = command;

    const history = command.messages ?? [];

    const enoughContext = true; // TODO(simon-the-sharp): Implement this

    if (!enoughContext) {
      const event = new ChatStartInterviewEvent(context, history);
      this.chatEventBus.emit(ChatStartInterviewEvent.name, event);
      this.logger.log(`Published event: ${JSON.stringify(event)}`);
      return Promise.resolve();
    }

    await this.commandBus.execute(new EndInterviewCommand(context, null));

    return Promise.resolve();
  }
}
