import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { ArrowLeft, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";
import { Route } from "@/routes/_authenticated";

export function ProfileView() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const canGoBack = useCanGoBack();
  const handleLogout = async (): Promise<void> => {
    await logout();
    await router.invalidate();
    await navigate({ to: "/" });
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="">
      <div className="mb-8 text-center">
        <div className="border-b-1 relative p-4">
          {canGoBack ? (
            <Button
              variant="ghost"
              onClick={() => {
                router.history.back();
              }}
              asChild
              className="absolute left-2 top-[50%] -translate-y-1/2 transform p-2"
            >
              <ArrowLeft className="h-10 w-10" />
            </Button>
          ) : null}
          <h1 className="text-foreground text-center text-xl font-semibold">
            Profile
          </h1>
        </div>
        {user === null ? null : (
          <div className="mt-6 flex flex-col items-center">
            <div className="relative mb-4">
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
              <p className="text-primary text-sm">{user.email}</p>
            </div>

            {isAdmin ? (
              <p className="mt-2 font-semibold text-purple-600">
                Administrator
              </p>
            ) : null}
          </div>
        )}
      </div>

      {isAdmin ? (
        <div className="mx-auto mb-8 w-[50%]">
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
