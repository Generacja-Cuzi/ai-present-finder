import { ApiProperty } from "@nestjs/swagger";

// this is only needed for swagger
export class ChatMessageDto {
  @ApiProperty({
    type: String,
    description: "Unique message identifier",
    format: "uuid",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  id!: string;

  @ApiProperty({
    type: String,
    description: "Message content",
    example: "Hello!",
  })
  content!: string;

  @ApiProperty({
    enum: ["user", "assistant"],
    description: "Message sender",
    example: "user",
  })
  sender!: "user" | "assistant";
}

export class SendMessageDto {
  @ApiProperty({
    type: ChatMessageDto,
    isArray: true,
    description: "Messages in the conversation",
  })
  messages!: ChatMessageDto[];

  @ApiProperty({
    type: String,
    description: "Chat identifier",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  chatId!: string;
}
