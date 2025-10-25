import { SSE_EVENTS, useSse } from "@/lib/sse";

import type { ChatSseMessage, ChatState } from "../types";

export const useSseChat = ({
  clientId,
  initialState,
}: {
  clientId: string;
  initialState: ChatState;
}) => {
  const state = useSse<ChatState, ChatSseMessage>(
    SSE_EVENTS.UI_UPDATE,
    initialState,
    {
      stateReducer: (previousState, action) => {
        switch (action.data.type) {
          case "chat-interview-completed": {
            return {
              type: "chat-interview-completed" as const,
            };
          }
          case "chat-inappropriate-request": {
            return {
              type: "chat-inappropriate-request" as const,
              data: { reason: action.data.reason },
            };
          }
          case "chatbot-message": {
            if (previousState.type !== "chatting") {
              throw new Error("Previous state is not chatting");
            }

            if (
              action.data.message.sender === "assistant" &&
              previousState.data.messages.at(-1)?.sender === "assistant"
            ) {
              // we already got this via REST and the SSE is duplicating it
              return previousState;
            }
            const { potentialAnswers, ...restOfMessage } = action.data.message;

            return {
              type: "chatting" as const,
              data: {
                messages: [
                  ...previousState.data.messages,
                  { ...restOfMessage, proposedAnswers: potentialAnswers },
                ],
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
