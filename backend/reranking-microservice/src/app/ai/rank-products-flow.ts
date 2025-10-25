import { openai } from "@ai-sdk/openai";
import type { ListingPayload, RecipientProfile } from "@core/types";
import { generateObject } from "ai";

import { productRankingPrompt } from "./prompt";
import type { ProductWithScore } from "./types";
import { rankedProductsOutputSchema } from "./types";

export async function rankProductsFlow({
  products,
  recipientProfile,
  keywords,
}: {
  products: ListingPayload[];
  recipientProfile: RecipientProfile | null;
  keywords: string[];
}): Promise<ProductWithScore[]> {
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
    (p, index) => `
<product id="${String(index + 1)}">
  <title>${p.title}</title>
  <description>${p.description}</description>
  <link>${p.link}</link>
  <price>${p.price.label ?? `${String(p.price.value ?? "N/A")} ${p.price.currency ?? ""}`}</price>
</product>
`,
  )
  .join("\n")}
</products>

Oceń każdy produkt w kontekście profilu odbiorcy i słów kluczowych. Zwróć wszystkie produkty z ich oryginalnymi danymi plus ocenę i uzasadnienie.
`;

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: rankedProductsOutputSchema,
      system: productRankingPrompt,
      prompt: userMessage,
    });

    const rankings = result.object.rankings;

    rankings.sort((a, b) => b.score - a.score);

    return rankings;
  } catch (error) {
    console.error("Failed to rank products with AI:", error);
    return products.map((product) => ({
      ...product,
      score: 5,
      reasoning: "Nie udało się ocenić produktu",
    }));
  }
}
