import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

import { ChatMessageDto, chatMessageSchema } from "./chat-message";

export const uiUpdateEvent = "ui-update";

export const sseMessageDtoSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("stalking-started"),
  }),
  z.object({
    type: z.literal("stalking-completed"),
  }),
  z.object({
    type: z.literal("chatbot-message"),
    message: chatMessageSchema,
  }),

  z.object({
    type: z.literal("chat-interview-completed"),
  }),
  z.object({
    type: z.literal("chat-inappropriate-request"),
    reason: z.string(),
  }),
  z.object({
    type: z.literal("gift-ready"),
    data: z.object({
      giftIdeas: z.array(z.string()),
    }),
  }),
]);

export type SseMessageDto = z.infer<typeof sseMessageDtoSchema>;
export type SseMessageType = SseMessageDto["type"];

export class SseStalkingStartedDto {
  @ApiProperty({ enum: ["stalking-started"], example: "stalking-started" })
  type!: "stalking-started";
}

export class SseStalkingCompletedDto {
  @ApiProperty({ enum: ["stalking-completed"], example: "stalking-completed" })
  type!: "stalking-completed";
}

export class SseChatbotMessageDto {
  @ApiProperty({ enum: ["chatbot-message"], example: "chatbot-message" })
  type!: "chatbot-message";

  @ApiProperty({
    type: ChatMessageDto,
    description: "Chat message from the bot",
  })
  message!: ChatMessageDto;
}

export class SseChatInterviewCompletedDto {
  @ApiProperty({
    enum: ["chat-interview-completed"],
    example: "chat-interview-completed",
  })
  type!: "chat-interview-completed";
}

export class SseChatInappropriateRequestDto {
  @ApiProperty({
    enum: ["chat-inappropriate-request"],
    example: "chat-inappropriate-request",
  })
  type!: "chat-inappropriate-request";

  @ApiProperty({
    description: "Reason why the request was inappropriate",
    example: "inappropriate content",
  })
  reason!: string;
}

export class SseGiftReadyDto {
  @ApiProperty({ enum: ["gift-ready"], example: "gift-ready" })
  type!: "gift-ready";

  @ApiProperty({
    type: Object,
    description: "Gift ideas payload",
    example: { giftIdeas: ["book", "pen"] },
  })
  data!: {
    giftIdeas: string[];
  };
}
