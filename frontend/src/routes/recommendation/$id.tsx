import type { ListingDto } from "@core/types";
import { createFileRoute, useLocation } from "@tanstack/react-router";

import { RecommendationView } from "../../features/recommendation/views/recommendation-view";

export const Route = createFileRoute("/recommendation/$id")({
  component: RecommendationPage,
});

function RecommendationPage() {
  const parameters = Route.useParams();
  const clientId = parameters.id;
  const location = useLocation();
  const giftIdeas =
    (location.state as { giftIdeas?: ListingDto[] } | undefined)?.giftIdeas ??
    [];

  return <RecommendationView clientId={clientId} giftIdeas={giftIdeas} />;
}
