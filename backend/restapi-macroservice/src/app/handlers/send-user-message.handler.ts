import { ChatUserAnsweredEvent } from "@core/events";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { SendUserMessageCommand } from "src/domain/commands/send-user-message.command";

import { Inject } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

@CommandHandler(SendUserMessageCommand)
export class SendUserMessageHandler
  implements ICommandHandler<SendUserMessageCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    @Inject("CHAT_USER_ANSWERED_EVENT") private readonly eventBus: ClientProxy,
  ) {}

  async execute(command: SendUserMessageCommand) {
    const { sendMessageDto } = command;
    const typedMessages = sendMessageDto.messages;
    const typedLastMessage = typedMessages.at(-1);

    const typedChatId = sendMessageDto.chatId;

    if (typedLastMessage == null || typedLastMessage.sender !== "user") {
      throw new Error("Last message is not from user");
    }

    await this.commandBus.execute(
      new NotifyUserSseCommand(typedChatId, {
        type: "chatbot-message",
        message: typedLastMessage,
      }),
    );

    const eventToEmit = new ChatUserAnsweredEvent(
      {
        keywords: [], // TODO(simon-the-shark): add previous keywords
        chatId: typedChatId,
      },
      typedMessages,
    );

    this.eventBus.emit(ChatUserAnsweredEvent.name, eventToEmit);
  }
}
