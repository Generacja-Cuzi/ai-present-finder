import { openai } from "@ai-sdk/openai";
import type { RecipientProfile } from "@core/types";
import { generateObject } from "ai";

import { serializeRecipientProfile } from "./profile-serializer";
import { giftIdeasGeneratorPrompt } from "./prompt";
import { giftIdeasOutputSchema } from "./types";

export async function giftIdeasFlow({
  userProfile,
  keywords,
  keyThemes,
}: {
  userProfile: RecipientProfile | null;
  keywords: string[];
  keyThemes: string[];
}) {
  const profileText = serializeRecipientProfile(userProfile);
  const keywordsText = keywords.join(", ");

  // Key themes have ABSOLUTE PRIORITY
  const keyThemesText =
    keyThemes.length > 0
      ? `\n\n⚠️⚠️⚠️ ABSOLUTNY PRIORYTET - KEY THEMES AND KEYWORDS ⚠️⚠️⚠️:\n${keyThemes.map((k) => `- "${k}"`).join("\n")}\n\n🔴 WSZYSTKIE pomysły i zapytania MUSZĄ być bezpośrednio związane z tymi tematami!\n🔴 To są GŁÓWNE TEMATY prezentów - minimum 70% pomysłów MUSI dotyczyć tych słów!\n🔴 Jeśli widzisz "fotel" - prezenty MUSZĄ być o fotelach!\n🔴 Jeśli widzisz "kawa" - prezenty MUSZĄ być o kawie/espresso!\n🔴 NIE ODBIEGAJ od tych tematów!`
      : "";

  const prompt = `
    Profil użytkownika: 
    ${profileText}
    ${keyThemesText}
    
    Dodatkowe słowa kluczowe ze stalkingu: ${keywordsText}
    
    ⚠️ PRZYPOMNIENIE: Jeśli key_themes_and_keywords zawiera konkretne tematy (np. "fotel", "fotografia", "kawa"),
    to WSZYSTKIE pomysły i zapytania MUSZĄ dotyczyć tych tematów. Nie generuj produktów niezwiązanych z key_themes!`;

  const result = await generateObject({
    model: openai("gpt-4o"), // Zmieniono z gpt-5-nano na gpt-4o dla lepszej jakości
    schema: giftIdeasOutputSchema,
    prompt,
    system: giftIdeasGeneratorPrompt,
  });
  return result.object;
}
