import { Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { paths } from "@/lib/api/types";

type UserProfile =
  paths["/user-profiles"]["get"]["responses"]["200"]["content"]["application/json"]["profiles"][number];

export function ProfileCardThemes({ profile }: { profile: UserProfile }) {
  if (profile.keyThemes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Tag className="h-3 w-3" />
        <span>Główne zainteresowania</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {profile.keyThemes.slice(0, 6).map((theme) => (
          <Badge
            key={theme}
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
  );
}
