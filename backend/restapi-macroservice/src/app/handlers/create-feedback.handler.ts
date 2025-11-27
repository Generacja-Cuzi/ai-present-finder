import { CreateFeedbackCommand } from "src/domain/commands/create-feedback.command";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { IFeedbackImageRepository } from "src/domain/repositories/ifeedback-image.repository";
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
    private readonly feedbackImageRepository: IFeedbackImageRepository,
  ) {}

  async execute(command: CreateFeedbackCommand): Promise<void> {
    // Validate rating
    if (command.rating < 1 || command.rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    // Validate comment length (max 300 words for general feedback, max 100 words for product feedback)
    if (command.comment !== null && command.comment.trim() !== "") {
      const wordCount = command.comment.trim().split(/\s+/).length;
      const maxWords = command.isGeneralFeedback ? 300 : 100;
      if (wordCount > maxWords) {
        throw new BadRequestException(
          `Comment cannot exceed ${String(maxWords)} words`,
        );
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

    // Validate images
    const maxImages = 5;
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    // Images are only allowed for general feedback
    if (command.images.length > 0 && !command.isGeneralFeedback) {
      throw new BadRequestException(
        "Images can only be attached to general feedback",
      );
    }

    if (command.images.length > maxImages) {
      throw new BadRequestException(
        `You can upload a maximum of ${String(maxImages)} images`,
      );
    }

    for (const image of command.images) {
      if (image.size > maxImageSize) {
        throw new BadRequestException(
          `Image size cannot exceed ${String(maxImageSize / (1024 * 1024))}MB`,
        );
      }
      if (!allowedMimeTypes.includes(image.mimeType)) {
        throw new BadRequestException(
          `Only JPEG, PNG, GIF, and WebP images are allowed`,
        );
      }
    }

    // Create feedback
    const feedback = await this.feedbackRepository.create({
      chatId: command.chatId,
      userId: command.userId,
      rating: command.rating,
      comment: command.comment,
      productId: command.productId,
      isGeneralFeedback: command.isGeneralFeedback,
    });

    // Create feedback images
    for (const image of command.images) {
      await this.feedbackImageRepository.create({
        feedbackId: feedback.id,
        imageData: image.buffer,
        mimeType: image.mimeType,
        fileSize: image.size,
      });
    }
  }
}
