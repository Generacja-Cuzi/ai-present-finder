import { MessageRole } from "src/domain/entities/message.entity";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProposedAnswerDto {
  @ApiProperty({
    description: "Full sentence answer",
    example: "Yes, I love it!",
  })
  answerFullSentence: string;

  @ApiProperty({
    description: "Short form answer",
    example: "Yes",
  })
  answerShortForm: string;
}

export class ProposedAnswersDto {
  @ApiProperty({
    description: "Type of proposed answers",
    enum: ["select", "long_free_text"],
    example: "select",
  })
  type: "select" | "long_free_text";

  @ApiPropertyOptional({
    description: "List of proposed answers",
    type: ProposedAnswerDto,
    isArray: true,
    required: false,
  })
  answers?: ProposedAnswerDto[];
}

export class MessageDto {
  @ApiProperty({
    description: "Message ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Chat ID",
    example: "cm123abc",
  })
  chatId: string;

  @ApiProperty({
    description: "Message role",
    enum: MessageRole,
    enumName: "MessageRole",
    example: MessageRole.USER,
  })
  role: MessageRole;

  @ApiProperty({
    description: "Message content",
    example: "I'm looking for a gift for my mom",
  })
  content: string;

  @ApiPropertyOptional({
    description: "Proposed answers for this message",
    type: ProposedAnswersDto,
    required: false,
  })
  proposedAnswers?: ProposedAnswersDto | null;

  @ApiProperty({
    description: "Created at timestamp",
    example: "2025-01-15T10:30:00Z",
  })
  createdAt: Date;
}

export class ChatMessagesResponseDto {
  @ApiProperty({
    description: "List of chat messages",
    type: MessageDto,
    isArray: true,
  })
  messages: MessageDto[];
}
