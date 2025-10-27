import { createFileRoute, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const handleLogin = async () => {
    try {
      await login();
      await router.invalidate();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await navigate({ to: "/" });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-foreground mb-6 text-4xl font-bold">Sign In</h1>

        <Button
          onClick={() => {
            void handleLogin();
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-full py-6 text-lg font-semibold shadow-lg transition-all active:scale-95"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
