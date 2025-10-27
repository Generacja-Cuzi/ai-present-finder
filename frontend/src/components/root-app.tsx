import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import { useAuth } from "@/features/auth/use-auth";
import type { Router } from "@/main";

export function RootApp({
  router,
  queryClient,
}: {
  router: Router;
  queryClient: QueryClient;
}) {
  const auth = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ queryClient, auth }} />
    </QueryClientProvider>
  );
}
