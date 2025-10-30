import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { paths } from "@/lib/api/types";

import { useUserProfiles } from "../../api/user-profiles";
import { ProfileList } from "./profile-list";
import { ProfileSearch } from "./profile-search";

type UserProfile =
  paths["/user-profiles"]["get"]["responses"]["200"]["content"]["application/json"]["profiles"][number];

export function ProfileSelectionDialog({
  open,
  onOpenChange,
  onSelectProfile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProfile: (profile: UserProfile) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useUserProfiles(open);

  const filteredProfiles = useMemo(() => {
    const profiles = data?.profiles ?? [];

    if (!searchQuery.trim()) {
      return profiles;
    }

    const query = searchQuery.toLowerCase();
    return profiles.filter((profile) => {
      const personName = profile.personName.toLowerCase();
      const relationship =
        profile.profile.personal_info.relationship?.toLowerCase() ?? "";
      const occasion =
        profile.profile.personal_info.occasion?.toLowerCase() ?? "";

      return (
        personName.includes(query) ||
        relationship.includes(query) ||
        occasion.includes(query)
      );
    });
  }, [data?.profiles, searchQuery]);

  const handleSelectProfile = (profile: UserProfile) => {
    onSelectProfile(profile);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Wybierz profil osoby</DialogTitle>
          <DialogDescription>
            Wybierz profil osoby, dla której wcześniej szukałeś prezentów
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ProfileSearch value={searchQuery} onChange={setSearchQuery} />

          <ProfileList
            profiles={filteredProfiles}
            onSelectProfile={handleSelectProfile}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Anuluj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
