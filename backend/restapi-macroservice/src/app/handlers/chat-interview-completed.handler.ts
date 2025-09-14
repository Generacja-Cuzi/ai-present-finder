import { CommandBus } from '@nestjs/cqrs';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { ChatInterviewCompleted } from 'src/domain/events/chat-interview-completed.event';

@Controller()
export class ChatInterviewCompletedHandler {
  private readonly logger = new Logger(ChatInterviewCompletedHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatInterviewCompleted.name)
  async handle(event: ChatInterviewCompleted) {
    this.logger.log(`Chat interview completed`);
    // TODO(simon-the-shark): Implement this
    // await this.commandBus.execute(
    //   new EvaluateContextCommand(event.context, event.messages),
    // );
  }
}
