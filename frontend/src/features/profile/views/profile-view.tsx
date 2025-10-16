import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { authApi } from "../../login/api/auth.api";
import { useAuthStore } from "../../login/store/auth.store";

export function ProfileView() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      clearAuth();
      void navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
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
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full rounded-full py-6 text-lg font-semibold shadow-lg transition-all active:scale-95"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
