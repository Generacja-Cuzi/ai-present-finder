import { z } from "zod";

export const endConversationOuputSchema = z.object({
  recipient_profile: z.array(z.string()),
  key_themes_and_keywords: z.array(z.string()),
  gift_recommendations: z.array(z.string()),
});

export type EndConversationOuput = z.infer<typeof endConversationOuputSchema>;
