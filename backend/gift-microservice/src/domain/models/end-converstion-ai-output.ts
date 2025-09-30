import z from "zod";

export const EndConversationOutput = z.object({
  recipient_profile: z.array(z.string()),
  key_themes_and_keywords: z.array(z.string()),
  gift_recommendations: z.array(z.string()),
});

export type EndConversationOutput = z.infer<typeof EndConversationOutput>;
