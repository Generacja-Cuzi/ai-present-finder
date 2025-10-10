import { openai } from "@ai-sdk/openai";
import type { RecipientProfile } from "@core/types";
import { generateObject } from "ai";

import { serializeRecipientProfile } from "./profile-serializer";
import { giftIdeasGeneratorPrompt } from "./prompt";
import type { GiftIdeasOutput } from "./types";
import { giftIdeasOutputSchema } from "./types";

export async function giftIdeasFlow({
  userProfile,
  keywords,
}: {
  userProfile: RecipientProfile | null;
  keywords: string[];
}): Promise<GiftIdeasOutput> {
  const profileText = serializeRecipientProfile(userProfile);
  const keywordsText = keywords.join(", ");

  const prompt = `
    Profil użytkownika:
    ${profileText}
    
    Słowa kluczowe: ${keywordsText}
`;

  const result = await generateObject({
    model: openai("gpt-5-nano"),
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    system: giftIdeasGeneratorPrompt,
    schema: giftIdeasOutputSchema,
  });

  return result.object;
}
