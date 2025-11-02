import { $api } from "@/lib/api/client";

export function useGetAllFeedbacks() {
  return $api.useQuery("get", "/feedback", {});
}
