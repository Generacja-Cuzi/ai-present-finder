import { Calendar, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { paths } from "@/lib/api/types";

type UserProfile =
  paths["/user-profiles"]["get"]["responses"]["200"]["content"]["application/json"]["profiles"][number];

export function ProfileCardHeader({ profile }: { profile: UserProfile }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <User className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold text-gray-900">
            {profile.personName}
          </h3>
        </div>
        {profile.profile.personal_info.relationship !== null &&
          profile.profile.personal_info.relationship !== undefined &&
          profile.profile.personal_info.relationship !== "" && (
            <p className="text-muted-foreground mt-1 text-sm">
              {profile.profile.personal_info.relationship}
            </p>
          )}
      </div>
      {profile.profile.personal_info.occasion !== null &&
        profile.profile.personal_info.occasion !== undefined &&
        profile.profile.personal_info.occasion !== "" && (
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {profile.profile.personal_info.occasion}
          </Badge>
        )}
    </div>
  );
}
