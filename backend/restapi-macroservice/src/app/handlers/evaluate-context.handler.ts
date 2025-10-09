import { ChatStartInterviewEvent } from "@core/events";
import { EndInterviewCommand } from "src/domain/commands/end-interview.command";
import { EvaluateContextCommand } from "src/domain/commands/evaluate-context.command";

import { Inject, Logger } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

@CommandHandler(EvaluateContextCommand)
export class EvaluateContextHandler
  implements ICommandHandler<EvaluateContextCommand>
{
  private readonly logger = new Logger(EvaluateContextHandler.name);

  constructor(
    @Inject("CHAT_START_INTERVIEW_EVENT")
    private readonly chatEventBus: ClientProxy,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: EvaluateContextCommand) {
    const { context } = command;

    const history = command.messages ?? [];

    const enoughContext = true; // TODO(simon-the-sharp): Implement this

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!enoughContext) {
      const event = new ChatStartInterviewEvent(context, history);
      this.chatEventBus.emit(ChatStartInterviewEvent.name, event);
      this.logger.log(`Published event: ${JSON.stringify(event)}`);
      return;
    }

    await this.commandBus.execute(new EndInterviewCommand(context, null));
  }
}
