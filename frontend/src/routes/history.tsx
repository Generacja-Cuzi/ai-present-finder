import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  component: HistoryLayout,
});

function HistoryLayout() {
  return <Outlet />;
}
