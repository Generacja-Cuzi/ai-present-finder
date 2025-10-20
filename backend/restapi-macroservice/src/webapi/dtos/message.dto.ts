import { ApiProperty } from "@nestjs/swagger";

export enum MessageRoleDto {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
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
    enum: MessageRoleDto,
    enumName: "MessageRoleDto",
    example: MessageRoleDto.USER,
  })
  role: MessageRoleDto;

  @ApiProperty({
    description: "Message content",
    example: "I'm looking for a gift for my mom",
  })
  content: string;

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
