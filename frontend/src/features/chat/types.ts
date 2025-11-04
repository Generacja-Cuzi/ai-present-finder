import type { ChatMessage, ListingWithId } from "@core/types";

import type { components } from "@/lib/api/types";

/**
 * Chat-specific state type
 */
export type ChatState =
  | {
      type: "chatting";
      data: {
        messages: ChatMessage[];
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

export type GiftSearchingState =
  | {
      type: "searching";
    }
  | {
      type: "ready";
      data: {
        giftIdeas: ListingWithId[];
      };
    };

export type SseGiftReadyDto = components["schemas"]["SseGiftReadyDto"];
