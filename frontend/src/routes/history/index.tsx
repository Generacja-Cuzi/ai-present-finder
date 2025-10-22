import { createFileRoute } from "@tanstack/react-router";

import { HistoryView } from "@/features/history/views/history-view";

export const Route = createFileRoute("/history/")({
  component: HistoryView,
});
