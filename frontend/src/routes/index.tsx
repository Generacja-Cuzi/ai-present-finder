import { createFileRoute, redirect } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";

import { HomeView } from "../features/home/components/home-view";
import { isAuthenticatedAtom } from "../lib/login/auth.store";

const store = getDefaultStore();

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const isAuthenticated = store.get(isAuthenticatedAtom);

    if (isAuthenticated) {
      return redirect({ to: "/stalking", replace: true });
    }
  },
  component: App,
});

function App() {
  return <HomeView />;
}
