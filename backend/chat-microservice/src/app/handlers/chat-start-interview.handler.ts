import { CommandBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ChatStartInterviewEvent } from 'src/domain/events/chat-start-interview.event';
import { GenerateQuestionCommand } from 'src/domain/commands/generate-question.command';

@Controller()
export class ChatStartInterviewHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatStartInterviewEvent.name)
  async handle(event: ChatStartInterviewEvent) {
    await this.commandBus.execute(
      new GenerateQuestionCommand(event.context, [
        {
          sender: 'user',
          content: 'Hi!',
          id: '1',
        },
      ]),
    );
  }
}
