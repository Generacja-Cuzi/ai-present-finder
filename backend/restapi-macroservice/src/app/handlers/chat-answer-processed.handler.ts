import { CommandBus } from '@nestjs/cqrs';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { EvaluateContextCommand } from 'src/domain/commands/evaluate-context.command';
import { ChatAnswerProcessedEvent } from 'src/domain/events/chat-answer-processed.event';

@Controller()
export class ChatAnswerProcessedHandler {
  private readonly logger = new Logger(ChatAnswerProcessedHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatAnswerProcessedEvent.name)
  async handle(event: ChatAnswerProcessedEvent) {
    this.logger.log(`Uzyskano keywords`);

    await this.commandBus.execute(
      new EvaluateContextCommand(event.context, event.history),
    );
  }
}
