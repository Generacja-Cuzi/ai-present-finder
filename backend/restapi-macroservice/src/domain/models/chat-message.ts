import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

export const chatMessageSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  sender: z.enum(["user", "assistant"]),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export class ChatMessageDto implements ChatMessage {
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
