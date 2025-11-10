import { createFileRoute } from "@tanstack/react-router";

import { LandingView } from "@/features/landing/views/landing-view";

export const Route = createFileRoute("/")({
  component: LandingView,
});
