import { createFileRoute, redirect } from "@tanstack/react-router";

import { FeedbacksView } from "@/features/admin/views/feedbacks-view";

export const Route = createFileRoute("/_authenticated/admin/feedbacks")({
  beforeLoad: ({ context }) => {
    // Only allow admins
    if (context.auth.user?.role !== "admin") {
      throw redirect({
        to: "/profile",
      });
    }
  },
  component: FeedbacksView,
});
