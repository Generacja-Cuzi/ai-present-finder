import type { ListingDto } from "@core/types";

export type GiftSearchingState =
  | {
      type: "searching";
    }
  | {
      type: "ready";
      data: {
        giftIdeas: ListingDto[];
      };
    };

export interface GiftSearchingSseMessage {
  type: "gift-ready";
  data: { giftIdeas: ListingDto[] };
}
