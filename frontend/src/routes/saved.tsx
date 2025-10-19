import { createFileRoute } from "@tanstack/react-router";

import { SavedView } from "@/features/saved";

export const Route = createFileRoute("/saved")({
  component: SavedView,
});
