import { useMemo } from "react";

import { SSE_EVENTS, useSse } from "@/lib/sse";

import type { ChatState, SseMessageDto } from "../types";

/**
 * Chat-specific SSE hook.
 * Manages chat state based on SSE events from the backend.
 */
export const useSseChat = ({ clientId }: { clientId: string }) => {
  const initialState: ChatState = useMemo(
    () => ({
      type: "chatting",
      data: {
        messages: [],
      },
    }),
    [],
  );

  const state = useSse<ChatState, SseMessageDto>(
    SSE_EVENTS.UI_UPDATE,
    initialState,
    {
      stateReducer: (previousState, action) => {
        switch (action.data.type) {
          case "chat-interview-completed": {
            return {
              type: "waiting-for-gift-ideas",
            };
          }
          case "chat-inappropriate-request": {
            return {
              type: "chat-inappropriate-request",
              data: { reason: action.data.reason },
            };
          }
          case "chatbot-message": {
            if (previousState.type !== "chatting") {
              throw new Error("Previous state is not chatting");
            }
            return {
              type: "chatting",
              data: {
                messages: [...previousState.data.messages, action.data.message],
              },
            };
          }
          case "gift-ready": {
            return {
              type: "gift-ready",
              data: { giftIdeas: action.data.data.giftIdeas },
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
