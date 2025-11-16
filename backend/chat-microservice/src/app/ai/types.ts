import { z } from "zod";

export const recipientProfileSchema = z.object({
  personalInfoDescription: z.object({
    relationship: z.string().nullish(),
    occasion: z.string().nullish(),
    ageRange: z.string().nullish(),
  }),
  lifestyleDescription: z.string().nullish(),
  preferencesDescription: z.string().nullish(),
  recentLifeDescription: z.string().nullish(),
  possessions: z.object({
    what_already_has: z.array(z.string()),
    what_is_missing: z.array(z.string()),
  }),
});

export const endConversationOutputSchema = z.object({
  recipient_profile: recipientProfileSchema,
  key_themes_and_keywords: z.array(z.string()),
  save_profile: z
    .boolean()
    .describe("Whether the user wants to save this profile for future use"),
  profile_name: z
    .string()
    .nullish()
    .describe("The name for this saved profile (only if save_profile is true)"),
});

export const potencialAnswersSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("select"),
    answers: z
      .array(
        z.object({
          answerFullSentence: z.string(),
          answerShortForm: z.string(),
        }),
      )
      .length(4),
  }),
  z.object({
    type: z.literal("long_free_text"),
  }),
]);

export type RecipientProfile = z.infer<typeof recipientProfileSchema>;

export type EndConversationOutput = z.infer<typeof endConversationOutputSchema>;

export type PotencialAnswers = z.infer<typeof potencialAnswersSchema>;
