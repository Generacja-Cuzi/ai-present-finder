import { createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { RootApp } from "@/components/root-app";
import { AuthProvider } from "@/features/auth/auth-provider";
import { getContext } from "@/lib/tanstack-query/get-context";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const queryClientContext = getContext();
const router = createRouter({
  routeTree,
  context: {
    ...queryClientContext,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    auth: undefined!,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

export type Router = typeof router;
// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.querySelector("#app");
if (rootElement != null && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider>
        <RootApp router={router} queryClient={queryClientContext.queryClient} />
      </AuthProvider>
    </StrictMode>,
  );
}
