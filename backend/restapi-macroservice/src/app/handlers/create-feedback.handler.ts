import { CreateFeedbackCommand } from "src/domain/commands/create-feedback.command";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { IFeedbackRepository } from "src/domain/repositories/ifeedback.repository";

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(CreateFeedbackCommand)
export class CreateFeedbackHandler
  implements ICommandHandler<CreateFeedbackCommand>
{
  constructor(
    private readonly feedbackRepository: IFeedbackRepository,
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(command: CreateFeedbackCommand): Promise<void> {
    // Validate rating
    if (command.rating < 1 || command.rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    // Check if chat exists
    const chat = await this.chatRepository.findByChatId(command.chatId);
    if (!chat) {
      throw new NotFoundException(`Chat with id ${command.chatId} not found`);
    }

    // Check if user owns the chat
    const isOwner = await this.chatRepository.isOwnedByUser(
      command.chatId,
      command.userId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        "You can only provide feedback for your own chats",
      );
    }

    // Check if feedback already exists for this chat
    const existingFeedback = await this.feedbackRepository.existsByChatId(
      command.chatId,
    );
    if (existingFeedback) {
      throw new BadRequestException("Feedback already exists for this chat");
    }

    // Create feedback
    await this.feedbackRepository.create({
      chatId: command.chatId,
      userId: command.userId,
      rating: command.rating,
      comment: command.comment,
    });
  }
}
