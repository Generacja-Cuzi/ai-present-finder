import { Calendar, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { paths } from "@/lib/api/types";

type UserProfile =
  paths["/user-profiles"]["get"]["responses"]["200"]["content"]["application/json"]["profiles"][number];

export function ProfileCardHeader({ profile }: { profile: UserProfile }) {
  const relationship = profile.profile.personal_info?.relationship;
  const occasion = profile.profile.personal_info?.occasion;

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <User className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold text-gray-900">
            {profile.personName}
          </h3>
        </div>
        {relationship !== undefined && (
          <p className="text-muted-foreground mt-1 text-sm">{relationship}</p>
        )}
      </div>
      {occasion !== undefined && (
        <Badge variant="secondary" className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {occasion}
        </Badge>
      )}
    </div>
  );
}
