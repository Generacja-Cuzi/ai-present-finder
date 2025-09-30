import { z } from "zod";

export const chatMessageSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  sender: z.enum(["user", "assistant"]),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
