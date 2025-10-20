import { $api } from "@/lib/api/client";

export function useStalkingRequestMutation() {
  return $api.useMutation("post", "/restapi/stalking-request");
}
