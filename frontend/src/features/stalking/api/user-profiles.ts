import { $api } from "@/lib/api/client";

export function useUserProfiles(enabled: boolean) {
  return $api.useQuery("get", "/user-profiles", {
    queryKey: ["user-profiles"],
    enabled,
  });
}
