import { openai } from "@ai-sdk/openai";
import type { RecipientProfile } from "@core/types";
import { generateObject } from "ai";

import { serializeRecipientProfile } from "./profile-serializer";
import { giftIdeasGeneratorPrompt } from "./prompt";
import { giftIdeasOutputSchema } from "./types";

export async function giftIdeasFlow({
  userProfile,
  keywords,
}: {
  userProfile: RecipientProfile | null;
  keywords: string[];
}) {
  const profileText = serializeRecipientProfile(userProfile);
  const keywordsText = keywords.join(", ");

  const prompt = `
    Profil użytkownika: 
    ${profileText}
    
    Słowa kluczowe: ${keywordsText}`;

  const result = await generateObject({
    model: openai("gpt-4o"), // Zmieniono z gpt-5-nano na gpt-4o dla lepszej jakości
    schema: giftIdeasOutputSchema,
    prompt,
    system: giftIdeasGeneratorPrompt,
  });
  return result.object;
}
