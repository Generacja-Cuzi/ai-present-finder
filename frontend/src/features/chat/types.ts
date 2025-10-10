import type { ChatMessage, ListingDto } from "@core/types";

export const uiUpdateEvent = "ui-update";

export type ChatState =
  | { type: "stalking-started" }
  | { type: "stalking-completed" }
  | { type: "chatting"; data: { messages: ChatMessage[] } }
  | { type: "gift-ready"; data: { giftIdeas: ListingDto[] } }
  | { type: "chat-interview-completed" }
  | { type: "chat-inappropriate-request"; data: { reason: string } };

export type { SseMessageDto } from "../../../../backend/restapi-macroservice/src/domain/models/sse-message.dto";
