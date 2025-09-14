import { z } from 'zod';
import { chatMessageSchema } from './chat-message';

export const uiUpdateEvent = 'ui-update';

export const SseMessageDto = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('stalking-started'),
  }),
  z.object({
    type: z.literal('stalking-completed'),
  }),
  z.object({
    type: z.literal('chatbot-message'),
    message: chatMessageSchema,
  }),
  z.object({
    type: z.literal('gift-ready'),
    data: z.object({
      giftIdeas: z.array(z.string()),
    }),
  }),
]);

export type SseMessageDto = z.infer<typeof SseMessageDto>;
export type SseMessageType = SseMessageDto['type'];
