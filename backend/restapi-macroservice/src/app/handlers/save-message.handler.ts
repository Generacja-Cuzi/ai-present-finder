import { SaveMessageCommand } from "src/domain/commands/save-message.command";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { IMessageRepository } from "src/domain/repositories/imessage.repository";

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(SaveMessageCommand)
export class SaveMessageHandler implements ICommandHandler<SaveMessageCommand> {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(command: SaveMessageCommand): Promise<void> {
    await this.messageRepository.create({
      chatId: command.chatId,
      content: command.content,
      role: command.role,
      proposedAnswers: command.proposedAnswers,
    });
  }
}
