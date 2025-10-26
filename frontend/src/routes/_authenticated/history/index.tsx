import { createFileRoute } from "@tanstack/react-router";

import { HistoryView } from "@/features/history/views/history-view";

export const Route = createFileRoute("/_authenticated/history/")({
  component: HistoryView,
});
