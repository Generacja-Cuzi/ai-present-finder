import type { paths } from "@/lib/api/types";

import { ProfileCardFooter } from "./profile-card-footer";
import { ProfileCardHeader } from "./profile-card-header";
import { ProfileCardThemes } from "./profile-card-themes";

type UserProfile =
  paths["/user-profiles"]["get"]["responses"]["200"]["content"]["application/json"]["profiles"][number];

export function ProfileCard({
  profile,
  onSelect,
}: {
  profile: UserProfile;
  onSelect: (profile: UserProfile) => void;
}) {
  const handleSelect = () => {
    onSelect(profile);
  };

  return (
    <button
      onClick={handleSelect}
      className="hover:border-primary focus:border-primary hover:bg-accent/50 focus:ring-primary/20 group w-full rounded-lg border-2 border-transparent bg-white p-4 text-left shadow-sm transition-all focus:outline-none focus:ring-2"
    >
      <div className="space-y-3">
        <ProfileCardHeader profile={profile} />
        <ProfileCardThemes profile={profile} />
        <ProfileCardFooter profile={profile} onSelect={handleSelect} />
      </div>
    </button>
  );
}
