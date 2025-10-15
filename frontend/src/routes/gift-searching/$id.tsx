import { createFileRoute } from "@tanstack/react-router";

import { GiftSearchingView } from "../../features/gift-searching/views/gift-searching-view";

export const Route = createFileRoute("/gift-searching/$id")({
  component: GiftSearchingPage,
});

function GiftSearchingPage() {
  const parameters = Route.useParams();
  const clientId = parameters.id;
  return <GiftSearchingView clientId={clientId} />;
}
