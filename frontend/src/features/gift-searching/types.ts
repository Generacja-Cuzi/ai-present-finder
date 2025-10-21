import type { ListingWithId } from "@core/types";

import type { components } from "@/lib/api/types";

export type GiftSearchingState =
  | {
      type: "searching";
    }
  | {
      type: "ready";
      data: {
        giftIdeas: ListingWithId[];
      };
    };

export type SseGiftReadyDto = components["schemas"]["SseGiftReadyDto"];
