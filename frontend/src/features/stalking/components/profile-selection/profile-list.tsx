import { ScrollArea } from "@/components/ui/scroll-area";
import type { paths } from "@/lib/api/types";

import { ProfileCard } from "./profile-card";

type UserProfile =
  paths["/user-profiles"]["get"]["responses"]["200"]["content"]["application/json"]["profiles"][number];

export function ProfileList({
  profiles,
  onSelectProfile,
  isLoading,
  searchQuery,
}: {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  isLoading: boolean;
  searchQuery: string;
}) {
  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-muted-foreground">Ładowanie profili...</div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-muted-foreground text-center">
          {searchQuery === ""
            ? "Nie masz jeszcze żadnych zapisanych profili"
            : "Nie znaleziono profili"}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onSelect={onSelectProfile}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
