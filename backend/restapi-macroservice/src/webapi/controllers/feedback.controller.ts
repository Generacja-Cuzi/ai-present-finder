import type { Response } from "express";
import type { FeedbackImageData } from "src/domain/commands/create-feedback.command";
import { CreateFeedbackCommand } from "src/domain/commands/create-feedback.command";
import type { Feedback } from "src/domain/entities/feedback.entity";
import type { AuthenticatedRequest } from "src/domain/models/auth.types";
import { GetAllFeedbacksQuery } from "src/domain/queries/get-all-feedbacks.query";
import { GetFeedbackByChatIdQuery } from "src/domain/queries/get-feedback-by-chat-id.query";
import { IFeedbackImageRepository } from "src/domain/repositories/ifeedback-image.repository";
import {
  CreateFeedbackDto,
  FeedbackImageResponseDto,
  FeedbackResponseDto,
} from "src/webapi/dtos/feedback.dto";

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../../app/guards/jwt-auth.guard";
import { RolesGuard } from "../../app/guards/roles.guard";
import { Roles } from "../../domain/decorators/roles.decorator";
import { UserRole } from "../../domain/entities/user.entity";

@ApiTags("feedback")
@Controller("feedback")
export class FeedbackController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly feedbackImageRepository: IFeedbackImageRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor("images", 5))
  @ApiOperation({ summary: "Create feedback for a chat" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        chatId: { type: "string" },
        rating: { type: "number" },
        comment: { type: "string", nullable: true },
        productId: { type: "string", nullable: true },
        isGeneralFeedback: { type: "boolean" },
        images: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: "Feedback successfully created",
  })
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const images: FeedbackImageData[] = files.map((file) => ({
      buffer: file.buffer,
      mimeType: file.mimetype,
      size: file.size,
    }));

    await this.commandBus.execute(
      new CreateFeedbackCommand(
        request.user.id,
        createFeedbackDto.chatId,
        createFeedbackDto.rating,
        createFeedbackDto.comment ?? null,
        createFeedbackDto.productId ?? null,
        createFeedbackDto.isGeneralFeedback ?? false,
        images,
      ),
    );

    return { message: "Feedback created successfully" };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get all feedbacks (Admin only)" })
  @ApiOkResponse({
    description: "Returns all feedbacks",
    type: [FeedbackResponseDto],
  })
  async getAllFeedbacks(): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.queryBus.execute<
      GetAllFeedbacksQuery,
      Feedback[]
    >(new GetAllFeedbacksQuery());

    const feedbacksWithImageCounts = await Promise.all(
      feedbacks.map(async (feedback) => {
        const images = await this.feedbackImageRepository.findByFeedbackId(
          feedback.id,
        );
        return {
          id: feedback.id,
          chatId: feedback.chatId,
          userId: feedback.userId,
          rating: feedback.rating,
          comment: feedback.comment,
          productId: feedback.productId,
          isGeneralFeedback: feedback.isGeneralFeedback,
          imageCount: images.length,
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt,
        };
      }),
    );

    return feedbacksWithImageCounts;
  }

  @Get("chat/:chatId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: "Get feedbacks for a specific chat" })
  @ApiOkResponse({
    description: "Returns feedbacks for the chat",
    type: [FeedbackResponseDto],
  })
  async getFeedbackByChatId(
    @Param("chatId") chatId: string,
    @Req() _request: AuthenticatedRequest,
  ): Promise<FeedbackResponseDto[]> {
    // Admin może przeglądać wszystkie feedbacki
    // Zwykły użytkownik musi być właścicielem czatu (sprawdzane przez ResourceOwnershipGuard)
    const feedbacks = await this.queryBus.execute<
      GetFeedbackByChatIdQuery,
      Feedback[]
    >(new GetFeedbackByChatIdQuery(chatId));

    const feedbacksWithImageCounts = await Promise.all(
      feedbacks.map(async (feedback) => {
        const images = await this.feedbackImageRepository.findByFeedbackId(
          feedback.id,
        );
        return {
          id: feedback.id,
          chatId: feedback.chatId,
          userId: feedback.userId,
          rating: feedback.rating,
          comment: feedback.comment,
          productId: feedback.productId,
          isGeneralFeedback: feedback.isGeneralFeedback,
          imageCount: images.length,
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt,
        };
      }),
    );

    return feedbacksWithImageCounts;
  }

  @Get(":feedbackId/images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: "Get image metadata for a feedback" })
  @ApiOkResponse({
    description: "Returns image metadata for the feedback",
    type: [FeedbackImageResponseDto],
  })
  async getFeedbackImages(
    @Param("feedbackId") feedbackId: string,
  ): Promise<FeedbackImageResponseDto[]> {
    const images =
      await this.feedbackImageRepository.findByFeedbackId(feedbackId);

    return images.map((image) => ({
      id: image.id,
      mimeType: image.mimeType,
      fileSize: image.fileSize,
      createdAt: image.createdAt,
    }));
  }

  @Get("images/:imageId")
  @ApiOperation({ summary: "Get a feedback image" })
  @ApiOkResponse({
    description: "Returns the image file",
  })
  async getFeedbackImage(
    @Param("imageId") imageId: string,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.feedbackImageRepository.findById(imageId);

    if (image === null) {
      throw new BadRequestException("Image not found");
    }

    response.set({
      "Content-Type": image.mimeType,
      "Content-Length": image.fileSize,
    });
    response.send(image.imageData);
  }
}
