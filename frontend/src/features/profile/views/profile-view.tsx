import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";
import { Route } from "@/routes/_authenticated";

export function ProfileView() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const handleLogout = async () => {
    await logout();
    await router.invalidate();
    await navigate({ to: "/" });
  };
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground mb-2 text-3xl font-bold">Profile</h1>
            {user !== null && (
              <div className="text-muted-foreground space-y-1">
                <p className="text-lg">{user.name ?? "User"}</p>
                <p className="text-sm">{user.email}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full rounded-full py-6 text-lg font-semibold text-white shadow-lg transition-all active:scale-95"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
