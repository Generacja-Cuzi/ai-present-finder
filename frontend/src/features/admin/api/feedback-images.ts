import { $api } from "@/lib/api/client";

export function useGetFeedbackImages(feedbackId: string | undefined) {
  return $api.useQuery(
    "get",
    "/feedback/{feedbackId}/images",
    {
      params: {
        path: {
          feedbackId: feedbackId ?? "",
        },
      },
    },
    {
      enabled: feedbackId !== undefined,
    },
  );
}
