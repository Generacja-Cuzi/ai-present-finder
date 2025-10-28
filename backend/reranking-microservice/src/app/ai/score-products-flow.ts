import { google } from "@ai-sdk/google";
import type { ListingWithId, RecipientProfile } from "@core/types";
import { generateObject } from "ai";

import { productRankingPrompt } from "./prompt";
import type { ProductScore } from "./types";
import { productScoresOutputSchema } from "./types";

export async function scoreProductsFlow({
  products,
  recipientProfile,
  keywords,
}: {
  products: ListingWithId[];
  recipientProfile: RecipientProfile | null;
  keywords: string[];
}): Promise<ProductScore[]> {
  if (products.length === 0) {
    return [];
  }

  const userMessage = `
# Profil Odbiorcy Prezentu

${recipientProfile === null ? "Brak szczegółowego profilu odbiorcy." : JSON.stringify(recipientProfile, null, 2)}

# Słowa Kluczowe

${keywords.length > 0 ? keywords.join(", ") : "Brak słów kluczowych."}

# Produkty do Oceny
<products>
${products
  .map(
    (p) => `
<product id="${p.listingId}">
  <title>${p.title}</title>
  <description>${p.description}</description>
  <link>${p.link}</link>
  <price>${p.price.label ?? `${String(p.price.value ?? "N/A")} ${p.price.currency ?? ""}`}</price>
</product>
`,
  )
  .join("\n")}
</products>

<IMPORTANT>
  - Zwróć wszystkie produkty z ich oryginalnymi danymi plus ocenę i uzasadnienie.
  - Nie modyfikuj ani nie wymyślaj nowych produktów.
</IMPORTANT>
`;

  const result = await generateObject({
    model: google("gemini-2.5-flash-lite"),
    schema: productScoresOutputSchema,
    system: productRankingPrompt,
    prompt: userMessage,
  });

  return result.object.scores;
}
