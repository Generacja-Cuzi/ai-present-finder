import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-foreground mb-6 text-5xl font-bold">
          Find the Perfect Gift
        </h1>

        <p className="text-muted-foreground mb-8 text-lg">
          Discover personalized gift recommendations for your loved ones.
        </p>
        {user === null ? (
          <Button
            onClick={() => {
              void navigate({ to: "/login" });
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-full py-6 text-lg font-semibold shadow-lg transition-all active:scale-95"
          >
            Get Started
          </Button>
        ) : (
          <>
            <p className="text-muted-foreground mb-8 text-lg">
              Welcome back, {user.email}!
            </p>
            <Link
              href="/stalking"
              to={"/stalking"}
              className="text-primary underline"
            >
              Begin
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
