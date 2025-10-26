import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { GiftSearchingView } from "../../../features/gift-searching/views/gift-searching-view";

const parametersSchema = z.object({
  id: z.string(),
});

export const Route = createFileRoute("/_authenticated/gift-searching/$id")({
  beforeLoad: ({ params }) => {
    const { id } = parametersSchema.parse(params);
    return { clientId: id };
  },
  component: GiftSearchingPage,
});

function GiftSearchingPage() {
  const context = Route.useRouteContext();
  const clientId = context.clientId;
  return <GiftSearchingView clientId={clientId} />;
}
