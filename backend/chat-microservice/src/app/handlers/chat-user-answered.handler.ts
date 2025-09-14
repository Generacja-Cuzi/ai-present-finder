import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern } from '@nestjs/microservices';
import { GenerateQuestionCommand } from 'src/domain/commands/generate-question.command';

import { ChatUserAnsweredEvent } from 'src/domain/events/chat-user-answered.event';

@Controller()
export class ChatUserAnsweredHandler {
  constructor(
    //  @Inject('CHAT_INTERVIEW_COMPLETED_EVENT')
    // private readonly chatInterviewCompletedEventBus: ClientProxy,

    private readonly commandBus: CommandBus,
  ) {}

  @EventPattern(ChatUserAnsweredEvent.name)
  async handle(event: ChatUserAnsweredEvent) {
    // TODO(simon-the-shark): call ai and anwser or end interview

    await this.commandBus.execute(
      new GenerateQuestionCommand(event.context, event.messages),
    );

    // this.chatInterviewCompletedEventBus.emit(
    //   ChatInterviewCompletedEvent.name,
    //   chatInterviewCompletedEvent,
    // );

    return Promise.resolve();
  }
}
