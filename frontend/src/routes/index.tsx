import { createFileRoute } from "@tanstack/react-router";

import { HomeView } from "../features/home/components/home-view";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return <HomeView />;
}
