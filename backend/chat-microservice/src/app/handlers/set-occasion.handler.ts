import { SetOccasionCommand } from "src/domain/commands/set-occasion.command";
import { ChatSession } from "src/domain/entities/chat-session.entity";
import { Repository } from "typeorm";

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

@CommandHandler(SetOccasionCommand)
export class SetOccasionHandler implements ICommandHandler<SetOccasionCommand> {
  constructor(
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
  ) {}

  async execute(command: SetOccasionCommand): Promise<void> {
    const { chatId, occasion } = command;

    await this.chatSessionRepository.upsert(
      {
        chatId,
        occasion,
        updatedAt: new Date(),
      },
      ["chatId"],
    );
  }
}
