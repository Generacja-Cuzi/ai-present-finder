import { useMemo } from "react";
import { useSSE } from "react-hooks-sse";

import { uiUpdateEvent } from "../types";
import type { ChatState, SseMessageDto } from "../types";

export const useSseChat = ({ clientId }: { clientId: string }) => {
  const initialState: ChatState = useMemo(
    () => ({ type: "stalking-started" }),
    [],
  );

  const state = useSSE<ChatState, SseMessageDto>(
    uiUpdateEvent,
    initialState,

    {
      stateReducer: (previousState, action) => {
        switch (action.data.type) {
          case "stalking-started": {
            return { type: "stalking-started" };
          }
          case "stalking-completed": {
            return { type: "stalking-completed" };
          }
          case "chat-interview-completed": {
            return { type: "chat-interview-completed" };
          }
          case "chat-inappropriate-request": {
            return {
              type: "chat-inappropriate-request",
              data: { reason: action.data.reason },
            };
          }
          case "chatbot-message": {
            if (previousState.type !== "chatting") {
              return {
                type: "chatting",
                data: {
                  messages: [action.data.message],
                },
              };
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
        }
      },
    },
  );

  return {
    state,
    clientId,
  };
};
