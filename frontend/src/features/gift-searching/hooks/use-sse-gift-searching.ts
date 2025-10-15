import { useMemo } from "react";

import { SSE_EVENTS, useSse } from "@/lib/sse";

import type { GiftSearchingSseMessage, GiftSearchingState } from "../types";

export const useSseGiftSearching = ({ clientId }: { clientId: string }) => {
  const initialState: GiftSearchingState = useMemo(
    () => ({
      type: "searching",
    }),
    [],
  );

  const state = useSse<GiftSearchingState, GiftSearchingSseMessage>(
    SSE_EVENTS.UI_UPDATE,
    initialState,
    {
      stateReducer: (_previousState, action) => {
        return {
          type: "ready",
          data: {
            giftIdeas: action.data.data.giftIdeas,
          },
        };
      },
    },
  );

  return {
    state,
    clientId,
  };
};
