import { openai } from "@ai-sdk/openai";
import type { BadProductInfo, ProviderCount } from "@core/events";
import type { RecipientProfile } from "@core/types";
import { generateObject } from "ai";

import { serializeRecipientProfile } from "./profile-serializer";
import { giftIdeasGeneratorPrompt } from "./prompt";
import { giftIdeasOutputSchema } from "./types";

export async function giftIdeasFlow({
  userProfile,
  keywords,
  keyThemes,
  badProducts,
  providerCounts,
}: {
  userProfile: RecipientProfile | null;
  keywords: string[];
  keyThemes: string[];
  badProducts?: BadProductInfo[];
  providerCounts?: ProviderCount[];
}) {
  const profileText = serializeRecipientProfile(userProfile);
  const keywordsText = keywords.join(", ");

  // Key themes have ABSOLUTE PRIORITY
  const keyThemesText =
    keyThemes.length > 0
      ? `\n\n⚠️⚠️⚠️ ABSOLUTNY PRIORYTET - KEY THEMES AND KEYWORDS ⚠️⚠️⚠️:\n${keyThemes.map((k) => `- "${k}"`).join("\n")}\n\n🔴 WSZYSTKIE pomysły i zapytania MUSZĄ być bezpośrednio związane z tymi tematami!\n🔴 To są GŁÓWNE TEMATY prezentów - minimum 70% pomysłów MUSI dotyczyć tych słów!\n🔴 Jeśli widzisz "fotel" - prezenty MUSZĄ być o fotelach!\n🔴 Jeśli widzisz "kawa" - prezenty MUSZĄ być o kawie/espresso!\n🔴 NIE ODBIEGAJ od tych tematów!`
      : "";

  // Build feedback about bad products (optional)
  const badProductsText =
    badProducts !== undefined && badProducts.length > 0
      ? `\n\n⚠️⚠️⚠️ FEEDBACK Z POPRZEDNICH WYSZUKIWAŃ - UNIKAJ TYCH PRODUKTÓW ⚠️⚠️⚠️:
Poniżej znajdują się produkty, które zostały ocenione jako NIEPASUJĄCE (score < 7):

${badProducts
  .slice(0, 20) // Limit to first 20 to avoid prompt bloat
  .map((p, index) => {
    const reasoningPart =
      p.reasoning !== null && p.reasoning.length > 0
        ? ` - Powód: ${p.reasoning}`
        : "";
    return `${String(index + 1)}. "${p.title}" (${p.provider}, score: ${String(p.score)})${reasoningPart}`;
  })
  .join("\n")}

🔴 UWAGA: NIE GENERUJ zapytań, które mogą zwrócić podobne produkty do powyższych!
🔴 Użyj tej informacji, aby ulepszyć swoje zapytania i znaleźć LEPSZE produkty!
`
      : "";

  // Build provider counts feedback (optional)
  const providerCountsText =
    providerCounts !== undefined && providerCounts.length > 0
      ? `\n\n📊 STATYSTYKI PRODUKTÓW PER PROVIDER Z POPRZEDNICH WYSZUKIWAŃ:
${providerCounts
  .map((pc) => `- ${pc.provider}: ${String(pc.count)} produktów`)
  .join("\n")}

💡 Użyj tej informacji, aby lepiej dopasować zapytania do każdego serwisu - niektóre serwisy mogą mieć więcej/mniej produktów w danej kategorii.
`
      : "";

  const regenerationNote =
    badProducts !== undefined && badProducts.length > 0
      ? `\n\n⚠️ WAŻNE: To jest REGENERACJA z pętlą ulepszeń. Użyj feedbacku o złych produktach, aby generować LEPSZE zapytania!`
      : "";

  const prompt = `
    Profil użytkownika: 
    ${profileText}
    ${keyThemesText}
    
    Dodatkowe słowa kluczowe ze stalkingu: ${keywordsText}
    ${badProductsText}
    ${providerCountsText}
    
    ⚠️ PRZYPOMNIENIE: Jeśli key_themes_and_keywords zawiera konkretne tematy (np. "fotel", "fotografia", "kawa"),
    to WSZYSTKIE pomysły i zapytania MUSZĄ dotyczyć tych tematów. Nie generuj produktów niezwiązanych z key_themes!${regenerationNote}`;

  const result = await generateObject({
    model: openai("gpt-4o"), // Zmieniono z gpt-5-nano na gpt-4o dla lepszej jakości
    schema: giftIdeasOutputSchema,
    prompt,
    system: giftIdeasGeneratorPrompt,
  });
  return result.object;
}
