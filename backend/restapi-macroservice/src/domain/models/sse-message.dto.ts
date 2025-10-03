import { z } from "zod";

import { chatMessageSchema } from "./chat-message";

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
export type SseMessageType = SseMessageDto['type'];

import { ApiProperty } from '@nestjs/swagger';

export class SseStalkingStartedDto {
  @ApiProperty({ example: 'stalking-started' })
  type: 'stalking-started';
}

export class SseStalkingCompletedDto {
  @ApiProperty({ example: 'stalking-completed' })
  type: 'stalking-completed';
}

export class SseChatbotMessageDto {
  @ApiProperty({ example: 'chatbot-message' })
  type: 'chatbot-message';

  @ApiProperty({ type: () => Object })
  message: any;
}

export class SseChatInterviewCompletedDto {
  @ApiProperty({ example: 'chat-interview-completed' })
  type: 'chat-interview-completed';
}

export class SseChatInappropriateRequestDto {
  @ApiProperty({ example: 'chat-inappropriate-request' })
  type: 'chat-inappropriate-request';

  @ApiProperty({
    description: 'Reason why the request was inappropriate',
    example: 'inappropriate content',
  })
  reason: string;
}

export class SseGiftReadyDto {
  @ApiProperty({ example: 'gift-ready' })
  type: 'gift-ready';

  @ApiProperty({ type: Object })
  data: {
    giftIdeas: string[];
  };
}
