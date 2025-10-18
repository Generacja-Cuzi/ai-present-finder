import type { ChatMessage } from "@core/types";

import type { components } from "@/lib/api/types";

/**
 * Chat-specific state type
 */
export type ChatState =
  | {
      type: "chatting";
      data: {
        messages: ChatMessage[];
        potentialAnswers?: components["schemas"]["PotencialAnswerChoiceDto"][];
      };
    }
  | { type: "chat-interview-completed" }
  | { type: "chat-inappropriate-request"; data: { reason: string } };

/**
 * Chat-specific SSE message types
 */
export type ChatSseMessage =
  | components["schemas"]["SseChatbotMessageDto"]
  | components["schemas"]["SseChatInterviewCompletedDto"]
  | components["schemas"]["SseChatInappropriateRequestDto"];
