import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { Navbar } from "@/components/ui/navbar";

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
  return (
    <>
      <Outlet />
      <Navbar />
    </>
  );
}
