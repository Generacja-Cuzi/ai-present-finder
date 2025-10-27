import type { ListingWithId } from "@core/types";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RecommendationView } from "../../../features/recommendation/views/recommendation-view";

const priceSchema = z.object({
  value: z.union([z.number(), z.null()]).transform((value) => {
    if (value === null) {
      return null;
    }
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
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

export const Route = createFileRoute("/_authenticated/recommendation/$id")({
  beforeLoad: ({ params, location }) => {
    const validatedParameters = parametersSchema.parse(params);

    const validatedState = locationStateSchema.parse(location.state);

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
