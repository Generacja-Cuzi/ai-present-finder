import { createFileRoute } from "@tanstack/react-router";

import { StalkingView } from "@/features/stalking/views/stalking-view";

export const Route = createFileRoute("/_authenticated/stalking")({
  component: StalkingView,
});
