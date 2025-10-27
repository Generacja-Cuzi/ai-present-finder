import type { ListingWithId } from "@core/types";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RecommendationView } from "../../features/recommendation/views/recommendation-view";

const priceSchema = z.object({
  value: z.union([z.number(), z.null()]).transform((val) => {
    if (val === null) return null;
    if (typeof val === "string") return Number.parseFloat(val);
    return val;
  }),
  label: z.string().nullable(),
  currency: z.string().nullable(),
  negotiable: z.boolean().nullable(),
});

const listingDtoSchema = z.object({
  listingId: z.string(),
  title: z.string(),
  link: z.string(),
  price: priceSchema,
  image: z.string().nullable(),
  description: z.string(),
  category: z.string().nullable().optional(),
  provider: z.string().optional(),
}) satisfies z.ZodType<ListingWithId>;

const locationStateSchema = z.object({
  giftIdeas: z.array(listingDtoSchema).optional(),
});

const parametersSchema = z.object({
  id: z.string().min(1, "Client ID is required"),
});

export const Route = createFileRoute("/recommendation/$id")({
  beforeLoad: ({ params, location }) => {
    const validatedParameters = parametersSchema.parse(params);

    console.group("🔍 Route - Before Validation");
    console.log("Raw location.state:", location.state);
    console.log("Raw giftIdeas:", (location.state as any)?.giftIdeas);
    if ((location.state as any)?.giftIdeas?.[0]) {
      console.log(
        "First gift before validation:",
        (location.state as any).giftIdeas[0],
      );
      console.log(
        "First gift category:",
        (location.state as any).giftIdeas[0].category,
      );
    }
    console.groupEnd();

    const validatedState = locationStateSchema.parse(location.state);

    console.group("🔍 Route - After Validation");
    console.log("Validated giftIdeas:", validatedState.giftIdeas);
    if (validatedState.giftIdeas?.[0]) {
      console.log("First gift after validation:", validatedState.giftIdeas[0]);
      console.log("First gift category:", validatedState.giftIdeas[0].category);
    }
    console.groupEnd();

    return {
      clientId: validatedParameters.id,
      giftIdeas: validatedState.giftIdeas ?? [],
    };
  },
  component: RecommendationPage,
});

function RecommendationPage() {
  const { clientId, giftIdeas } = Route.useRouteContext();

  return <RecommendationView clientId={clientId} giftIdeas={giftIdeas} />;
}
