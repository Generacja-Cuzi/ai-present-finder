import { createFileRoute } from "@tanstack/react-router";

import { ProfileView } from "@/features/profile/views/profile-view";

export const Route = createFileRoute("/profile")({
  component: ProfileView,
});
