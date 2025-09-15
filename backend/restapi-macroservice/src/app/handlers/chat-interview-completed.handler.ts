import { CommandBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { ChatInterviewCompletedEvent } from 'src/domain/events/chat-interview-completed.event';
import { EndInterviewCommand } from 'src/domain/commands/end-interview.command';

@Controller()
export class ChatInterviewCompletedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatInterviewCompletedEvent.name)
  async handle(event: ChatInterviewCompletedEvent) {
    await this.commandBus.execute(
      new EndInterviewCommand(event.context, event.profile),
    );
  }
}
