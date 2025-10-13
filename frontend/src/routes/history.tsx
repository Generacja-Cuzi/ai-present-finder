import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  component: HistoryView,
});

function HistoryView() {
  return (
    <div className="bg-surface flex min-h-screen flex-col items-center justify-center pb-20">
      <div className="text-center">
        <h1 className="text-foreground mb-4 text-3xl font-bold">
          Search History
        </h1>
        <p className="text-muted-foreground">
          Your search history will appear here
        </p>
      </div>
    </div>
  );
}
