import { CreateFeedbackCommand } from "src/domain/commands/create-feedback.command";
import type { Feedback } from "src/domain/entities/feedback.entity";
import type { AuthenticatedRequest } from "src/domain/models/auth.types";
import { GetAllFeedbacksQuery } from "src/domain/queries/get-all-feedbacks.query";
import { GetFeedbackByChatIdQuery } from "src/domain/queries/get-feedback-by-chat-id.query";
import {
  CreateFeedbackDto,
  FeedbackResponseDto,
} from "src/webapi/dtos/feedback.dto";

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
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
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: "Create feedback for a chat" })
  @ApiCreatedResponse({
    description: "Feedback successfully created",
  })
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new CreateFeedbackCommand(
        request.user.id,
        createFeedbackDto.chatId,
        createFeedbackDto.rating,
        createFeedbackDto.comment ?? null,
        createFeedbackDto.productId ?? null,
        createFeedbackDto.isGeneralFeedback ?? false,
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

    return feedbacks.map((feedback) => ({
      id: feedback.id,
      chatId: feedback.chatId,
      userId: feedback.userId,
      rating: feedback.rating,
      comment: feedback.comment,
      productId: feedback.productId,
      isGeneralFeedback: feedback.isGeneralFeedback,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    }));
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
  ): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.queryBus.execute<
      GetFeedbackByChatIdQuery,
      Feedback[]
    >(new GetFeedbackByChatIdQuery(chatId));

    return feedbacks.map((feedback) => ({
      id: feedback.id,
      chatId: feedback.chatId,
      userId: feedback.userId,
      rating: feedback.rating,
      comment: feedback.comment,
      productId: feedback.productId,
      isGeneralFeedback: feedback.isGeneralFeedback,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    }));
  }
}
