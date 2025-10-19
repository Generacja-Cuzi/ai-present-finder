import { createFileRoute, redirect } from "@tanstack/react-router";

import { HomeView } from "../features/home/components/home-view";
import { useAuthStore } from "../features/login/store/auth.store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated) {
      throw redirect({ to: "/stalking", replace: true });
    }
  },
  component: App,
});

function App() {
  return <HomeView />;
}
