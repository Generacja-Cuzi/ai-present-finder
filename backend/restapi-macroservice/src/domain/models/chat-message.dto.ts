import { ChatMessage } from "@core/types";

import { ApiProperty } from "@nestjs/swagger";

// needed for swagger
export class ChatMessageDto implements ChatMessage {
  @ApiProperty({
    description: "Unique message identifier",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  id!: string;

  @ApiProperty({
    description: "Message content",
    example: "Hello!",
  })
  content!: string;

  @ApiProperty({
    description: "Message sender",
    enum: ["user", "assistant"],
    example: "user",
  })
  sender!: "user" | "assistant";
}
