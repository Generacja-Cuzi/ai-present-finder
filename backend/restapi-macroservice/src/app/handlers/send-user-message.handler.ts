import { ChatUserAnsweredEvent } from "@core/events";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { SaveMessageCommand } from "src/domain/commands/save-message.command";
import { SendUserMessageCommand } from "src/domain/commands/send-user-message.command";
import { MessageRole } from "src/domain/entities/message.entity";

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

    // Save the user message to the database
    await this.commandBus.execute(
      new SaveMessageCommand(
        typedChatId,
        typedLastMessage.content,
        MessageRole.USER,
      ),
    );

    await this.commandBus.execute(
      new NotifyUserSseCommand(typedChatId, {
        type: "chatbot-message",
        message: typedLastMessage,
      }),
    );

    const eventToEmit = new ChatUserAnsweredEvent(typedChatId, typedMessages);

    this.eventBus.emit(ChatUserAnsweredEvent.name, eventToEmit);
  }
}
