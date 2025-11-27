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

    // Validate comment length (max 50 words)
    if (command.comment !== null && command.comment.trim() !== "") {
      const wordCount = command.comment.trim().split(/\s+/).length;
      if (wordCount > 50) {
        throw new BadRequestException("Comment cannot exceed 50 words");
      }
    }

    // Check if chat exists
    const chat = await this.chatRepository.findByChatId(command.chatId);
    if (chat === null) {
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

    // Check if feedback already exists for this specific product or general feedback
    if (command.isGeneralFeedback) {
      const existingGeneral = await this.feedbackRepository.findGeneralByChatId(
        command.chatId,
      );
      if (existingGeneral !== null) {
        throw new BadRequestException(
          "General feedback already exists for this chat",
        );
      }
    } else if (command.productId !== null) {
      const existingProduct =
        await this.feedbackRepository.findByChatIdAndProductId(
          command.chatId,
          command.productId,
        );
      if (existingProduct !== null) {
        throw new BadRequestException(
          "Feedback already exists for this product",
        );
      }
    }

    // Create feedback
    await this.feedbackRepository.create({
      chatId: command.chatId,
      userId: command.userId,
      rating: command.rating,
      comment: command.comment,
      productId: command.productId,
      isGeneralFeedback: command.isGeneralFeedback,
    });
  }
}
