import { useMemo } from "react";

import { SSE_EVENTS, useSse } from "@/lib/sse";

import type { ChatSseMessage, ChatState } from "../types";

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

  const state = useSse<ChatState, ChatSseMessage>(
    SSE_EVENTS.UI_UPDATE,
    initialState,
    {
      stateReducer: (previousState, action) => {
        switch (action.data.type) {
          case "chat-interview-completed": {
            return {
              type: "chat-interview-completed",
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
