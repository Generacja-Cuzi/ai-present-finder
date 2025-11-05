import { useRouter } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";
import { Route } from "@/routes/_authenticated";

export function ProfileView() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const handleLogout = async (): Promise<void> => {
    await logout();
    await router.invalidate();
    await navigate({ to: "/" });
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground mb-2 text-3xl font-bold">Profile</h1>
            {user === null ? null : (
              <div className="text-muted-foreground space-y-1">
                <p className="text-lg">{user.name ?? "User"}</p>
                <p className="text-sm">{user.email}</p>
                {isAdmin ? (
                  <p className="mt-2 text-xs font-semibold text-purple-600">
                    Administrator
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isAdmin ? (
              <Button
                onClick={() => {
                  void navigate({ to: "/admin/feedbacks" });
                }}
                variant="outline"
                className="w-full rounded-full py-6 text-lg font-semibold shadow-lg transition-all active:scale-95"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Feedbacks
              </Button>
            ) : null}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-red-600 hover:text-red-700"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
