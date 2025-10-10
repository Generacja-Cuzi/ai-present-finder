import type { ChatMessage, ListingDto } from "@core/types";

export const uiUpdateEvent = "ui-update";

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

export type { SseMessageDto } from "../../../../backend/restapi-macroservice/src/domain/models/sse-message.dto";
