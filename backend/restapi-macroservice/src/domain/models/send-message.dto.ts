import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

import { ChatMessageDto, chatMessageSchema } from "./chat-message";

export const sendMessageDtoSchema = z.object({
  messages: z.array(chatMessageSchema),
  chatId: z.string(),
});

export type SendMessageDto = z.infer<typeof sendMessageDtoSchema>;

export class SendMessageDtoDocument implements SendMessageDto {
  @ApiProperty({
    type: Object,
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
