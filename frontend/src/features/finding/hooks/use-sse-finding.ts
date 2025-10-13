import { useMemo } from "react";

import { SSE_EVENTS, useSse } from "@/lib/sse";

import type { RecommendationSseMessage, RecommendationState } from "../types";

interface UseSseRecommendationOptions {
  clientId: string;
}

export const useSseRecommendation = ({
  clientId,
}: UseSseRecommendationOptions) => {
  const initialState: RecommendationState = useMemo(
    () => ({
      type: "idle",
    }),
    [],
  );

  const state = useSse<RecommendationState, RecommendationSseMessage>(
    SSE_EVENTS.UI_UPDATE,
    initialState,
    {
      stateReducer: (previousState, action) => {
        switch (action.data.type) {
          case "recommendation-generating": {
            return {
              type: "generating",
            };
          }

          case "recommendation-ready": {
            return {
              type: "ready",
              data: {
                recommendations: action.data.recommendations,
              },
            };
          }

          case "recommendation-error": {
            return {
              type: "error",
              error: action.data.error,
            };
          }

          default: {
            return previousState;
          }
        }
      },
    },
  );

  return {
    state,
    clientId,
  };
};
