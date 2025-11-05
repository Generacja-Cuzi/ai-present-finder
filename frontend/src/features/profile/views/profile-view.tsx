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
    <div className="">
      <div className="mb-8 text-center">
        <h1 className="text-foreground mb-6 text-3xl font-bold">Profile</h1>
        {user === null ? null : (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={user.picture ?? "https://via.placeholder.com/150"}
                alt={`${user.givenName ?? "User"}'s profile`}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-gray-200"
              />
            </div>

            <div className="text-foreground">
              <p className="text-2xl font-semibold">
                {user.givenName !== null && user.familyName !== null
                  ? `${user.givenName} ${user.familyName}`
                  : "User"}
              </p>
            </div>

            <div className="text-muted-foreground">
              <p className="text-sm">{user.email}</p>
            </div>

            {isAdmin ? (
              <p className="text-xs font-semibold text-purple-600">
                Administrator
              </p>
            ) : null}
          </div>
        )}
      </div>

      {isAdmin ? (
        <div className="mb-8">
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
        </div>
      ) : null}

      <div className="mt-auto flex justify-center align-bottom">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="text-lg text-red-600 hover:text-red-700"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
