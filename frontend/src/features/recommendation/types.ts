import type { ListingPayload } from "@core/types";

export interface RecommendationState {
  type: "ready";
  data: {
    giftIdeas: ListingPayload[];
  };
}
