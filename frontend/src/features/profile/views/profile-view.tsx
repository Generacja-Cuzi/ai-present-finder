import { useRouter } from "@tanstack/react-router";

import { useAuth } from "@/features/auth/use-auth";
import { Route } from "@/routes/_authenticated";

import { ProfileActions } from "../components/profile-actions";
import { ProfileAvatar } from "../components/profile-avatar";
import { ProfileHeader } from "../components/profile-header";
import { ProfileInfo } from "../components/profile-info";
import { ProfileSettings } from "../components/profile-settings";

export function ProfileView() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigate = Route.useNavigate();

  const handleLogout = async (): Promise<void> => {
    await logout();
    await router.invalidate();
    await navigate({ to: "/" });
  };

  const handleViewFeedback = (): void => {
    void navigate({ to: "/admin/feedbacks" });
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ProfileHeader title="Profil" />

      {user === null ? null : (
        <div className="flex flex-1 flex-col items-center px-6 pb-24 pt-8">
          <ProfileAvatar
            src={user.picture}
            alt={`Profil użytkownika ${user.givenName ?? "Użytkownik"}`}
          />

          <ProfileInfo
            givenName={user.givenName}
            familyName={user.familyName}
            email={user.email}
            isAdmin={isAdmin}
          />

          <div className="mt-8 w-full max-w-2xl space-y-6">
            <ProfileSettings />

            <ProfileActions
              isAdmin={isAdmin}
              onViewFeedback={handleViewFeedback}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  );
}
