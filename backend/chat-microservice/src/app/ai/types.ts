import { z } from "zod";

export const recipientProfileSchema = z.object({
  personal_info: z.object({
    relationship: z.string().nullish(),
    occasion: z.string().nullish(),
    age_range: z.string().nullish(),
  }),
  lifestyle: z.object({
    primary_hobbies: z.array(z.string()).nullish(),
    daily_routine: z.string().nullish(),
    relaxation_methods: z.array(z.string()).nullish(),
    work_style: z.string().nullish(),
  }),
  preferences: z.object({
    home_aesthetic: z.string().nullish(),
    valued_items: z.array(z.string()).nullish(),
    favorite_beverages: z.array(z.string()).nullish(),
    comfort_foods: z.array(z.string()).nullish(),
  }),
  media_interests: z.object({
    favorite_books: z.array(z.string()).nullish(),
    must_watch_shows: z.array(z.string()).nullish(),
    podcasts: z.array(z.string()).nullish(),
    music_preferences: z.array(z.string()).nullish(),
  }),
  recent_life: z.object({
    new_experiences: z.array(z.string()).nullish(),
    mentioned_needs: z.array(z.string()).nullish(),
    recent_achievements: z.array(z.string()).nullish(),
  }),
  gift_context: z.object({
    occasion_significance: z.string().nullish(),
    gift_message: z.string().nullish(),
    previous_gift_successes: z.array(z.string()).nullish(),
  }),
});

export const endConversationOutputSchema = z.object({
  recipient_profile: recipientProfileSchema,
  key_themes_and_keywords: z.array(z.string()),
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
