import { useEffect, useMemo } from "react";

import { SSE_EVENTS, useSse } from "@/lib/sse";

import type {
  GiftSearchingState,
  SseGiftReadyDto,
  SseProgressUpdateDto,
} from "../types";

const STORAGE_KEY_PREFIX = "gift-search-progress-";

function getStorageKey(clientId: string): string {
  return `${STORAGE_KEY_PREFIX}${clientId}`;
}

function loadPersistedState(clientId: string): GiftSearchingState {
  try {
    const stored = sessionStorage.getItem(getStorageKey(clientId));
    if (stored !== null && stored !== "") {
      const parsed = JSON.parse(stored) as GiftSearchingState;
      // Only restore searching state, not ready state
      // (ready state should trigger navigation)
      if (parsed.type === "searching") {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load persisted progress state:", error);
  }
  return { type: "searching" };
}

function persistState(clientId: string, state: GiftSearchingState): void {
  try {
    sessionStorage.setItem(getStorageKey(clientId), JSON.stringify(state));
  } catch (error) {
    console.error("Failed to persist progress state:", error);
  }
}

function clearPersistedState(clientId: string): void {
  try {
    sessionStorage.removeItem(getStorageKey(clientId));
  } catch (error) {
    console.error("Failed to clear persisted progress state:", error);
  }
}

export const useSseGiftSearching = ({ clientId }: { clientId: string }) => {
  const initialState: GiftSearchingState = useMemo(
    () => loadPersistedState(clientId),
    [clientId],
  );

  const state = useSse<
    GiftSearchingState,
    SseGiftReadyDto | SseProgressUpdateDto
  >(SSE_EVENTS.UI_UPDATE, initialState, {
    stateReducer: (previousState, action) => {
      // Handle progress updates
      if (action.data.type === "progress-update") {
        const hasStalkingCompleted =
          previousState.type === "searching"
            ? (previousState.hasStalkingCompleted ?? false) ||
              action.data.stage === "stalking"
            : false;

        const newState: GiftSearchingState = {
          type: "searching",
          progress: {
            stage: action.data.stage,
            percentage: action.data.percentage,
            message: action.data.message,
          },
          hasStalkingCompleted,
        };

        // Persist to sessionStorage
        persistState(clientId, newState);

        return newState;
      }

      // Handle gift ready - we know it's gift-ready at this point
      // since we already handled progress-update above
      const newState: GiftSearchingState = {
        type: "ready",
        data: {
          giftIdeas: action.data.data,
        },
      };

      // Clear persisted state when search is complete
      clearPersistedState(clientId);

      return newState;
    },
  });

  // Clean up persisted state when component unmounts and search is ready
  useEffect(() => {
    return () => {
      if (state.type === "ready") {
        clearPersistedState(clientId);
      }
    };
  }, [clientId, state.type]);

  return {
    state,
    clientId,
  };
};
