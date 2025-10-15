import type { ListingDto } from "@core/types";

export interface RecommendationState {
  type: "ready";
  data: {
    giftIdeas: ListingDto[];
  };
}
