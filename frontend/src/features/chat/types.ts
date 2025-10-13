import type { ChatMessage, ListingDto } from "@core/types";

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
  | { type: "waiting-for-gift-ideas" }
  | { type: "gift-ready"; data: { giftIdeas: ListingDto[] } }
  | { type: "chat-inappropriate-request"; data: { reason: string } };

/**
 * Chat-specific SSE message types
 */
export type ChatSseMessage =
  | {
      type: "chatbot-message";
      message: ChatMessage;
    }
  | {
      type: "chat-interview-completed";
    }
  | {
      type: "chat-inappropriate-request";
      reason: string;
    }
  | {
      type: "gift-ready";
      data: { giftIdeas: ListingDto[] };
    };

// Re-export for backwards compatibility if needed
export type { SseMessageDto } from "../../../../backend/restapi-macroservice/src/domain/models/sse-message.dto";
