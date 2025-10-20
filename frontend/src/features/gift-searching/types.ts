import type { ListingPayload } from "@core/types";

import type { components } from "@/lib/api/types";

export type GiftSearchingState =
  | {
      type: "searching";
    }
  | {
      type: "ready";
      data: {
        giftIdeas: ListingPayload[];
      };
    };

export type SseGiftReadyDto = components["schemas"]["SseGiftReadyDto"];
