export interface UIChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
}

export const uiUpdateEvent = "ui-update";

export interface GiftIdea {
  image: string | null;
  title: string;
  description: string;
  link: string;
  price: {
    value: number | null;
    label: string | null;
    currency: string | null;
    negotiable: boolean | null;
  };
}

export type ChatState =
  | { type: "stalking-started" }
  | { type: "stalking-completed" }
  | { type: "chatting"; data: { messages: UIChatMessage[] } }
  | { type: "gift-ready"; data: { giftIdeas: GiftIdea[] } }
  | { type: "chat-interview-completed" }
  | { type: "chat-inappropriate-request"; data: { reason: string } };

export type { SseMessageDto } from "../../../../backend/restapi-macroservice/src/domain/models/sse-message.dto";
