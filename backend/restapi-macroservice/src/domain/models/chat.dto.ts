import { ApiProperty } from "@nestjs/swagger";

export class ChatDto {
  @ApiProperty({
    description: "Chat ID",
    example: "cm123abc",
  })
  chatId: string;

  @ApiProperty({
    description: "Chat name",
    example: "Gift for Mom",
  })
  chatName: string;

  @ApiProperty({
    description: "Created at timestamp",
    example: "2025-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Whether the chat interview has been completed",
    example: false,
  })
  isInterviewCompleted: boolean;
  @ApiProperty({
    description: "Number of gifts in the chat",
    example: 3,
  })
  giftCount: number;
}

export class ChatsResponseDto {
  @ApiProperty({
    description: "List of user's chats",
    type: ChatDto,
    isArray: true,
  })
  chats: ChatDto[];
}
