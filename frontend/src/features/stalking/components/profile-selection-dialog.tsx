import { Calendar, Search, Tag, User } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { $api } from "@/lib/api/client";
import type { paths } from "@/lib/api/types";

type UserProfile =
  paths["/user-profiles"]["get"]["responses"]["200"]["content"]["application/json"]["profiles"][number];

interface ProfileSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProfile: (profile: UserProfile) => void;
}

export function ProfileSelectionDialog({
  open,
  onOpenChange,
  onSelectProfile,
}: ProfileSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = $api.useQuery("get", "/user-profiles", {
    queryKey: ["user-profiles"],
    enabled: open,
  });

  const profiles = data?.profiles ?? [];

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return profiles;
    }

    const query = searchQuery.toLowerCase();
    return profiles.filter((profile) => {
      const personName = profile.personName.toLowerCase();
      const relationship =
        profile.profile.personal_info.relationship?.toLowerCase?.() ?? "";
      const occasion =
        profile.profile.personal_info.occasion?.toLowerCase?.() ?? "";

      return (
        personName.includes(query) ||
        relationship.includes(query) ||
        occasion.includes(query)
      );
    });
  }, [profiles, searchQuery]);

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
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Szukaj po imieniu, relacji lub okazji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="text-muted-foreground">Ładowanie profili...</div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="text-muted-foreground text-center">
                {searchQuery
                  ? "Nie znaleziono profili"
                  : "Nie masz jeszcze żadnych zapisanych profili"}
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    className="hover:border-primary focus:border-primary hover:bg-accent/50 focus:ring-primary/20 group w-full rounded-lg border-2 border-transparent bg-white p-4 text-left shadow-sm transition-all focus:outline-none focus:ring-2"
                  >
                    <div className="space-y-3">
                      {/* Header: Name and Relationship */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <User className="text-primary h-5 w-5" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {profile.personName}
                            </h3>
                          </div>
                          {profile.profile.personal_info.relationship && (
                            <p className="text-muted-foreground mt-1 text-sm">
                              {profile.profile.personal_info.relationship}
                            </p>
                          )}
                        </div>
                        {profile.profile.personal_info.occasion && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1.5"
                          >
                            <Calendar className="h-3 w-3" />
                            {profile.profile.personal_info.occasion}
                          </Badge>
                        )}
                      </div>

                      {/* Key Themes */}
                      {profile.keyThemes.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <Tag className="h-3 w-3" />
                            <span>Główne zainteresowania</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.keyThemes.slice(0, 6).map((theme, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-primary/5 text-primary border-primary/20 text-xs"
                              >
                                {theme}
                              </Badge>
                            ))}
                            {profile.keyThemes.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.keyThemes.length - 6} więcej
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer: Created Date */}
                      <div className="flex items-center justify-between border-t pt-2">
                        <p className="text-muted-foreground text-xs">
                          Utworzono:{" "}
                          {new Date(profile.createdAt).toLocaleDateString(
                            "pl-PL",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                        <span className="text-primary text-sm transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
