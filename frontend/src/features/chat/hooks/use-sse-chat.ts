import { useMemo } from "react";
import { useSSE } from "react-hooks-sse";

import { uiUpdateEvent } from "../types";
import type { ChatState, SseMessageDto } from "../types";

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

  const state = useSSE<ChatState, SseMessageDto>(
    uiUpdateEvent,
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
