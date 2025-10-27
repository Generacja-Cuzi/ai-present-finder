import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { Navbar } from "@/components/ui/navbar";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) {
      return;
    }

    if (!context.auth.isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Authenticated />,
});

function Authenticated() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <Navbar />
    </>
  );
}
