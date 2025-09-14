import { z } from 'zod';
import { chatMessageSchema } from './chat-message';

export const sendMessageDtoSchema = z.object({
  messages: z.array(chatMessageSchema),
  chatId: z.string(),
});

export type SendMessageDto = z.infer<typeof sendMessageDtoSchema>;
