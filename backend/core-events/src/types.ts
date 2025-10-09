// Shared types used across events

export interface ContextDto {
  keywords: string[];
  chatId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
}

export interface EndConversationOutput {
  recipient_profile: string[];
  key_themes_and_keywords: string[];
  gift_recommendations: string[];
}

export interface ListingDto {
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
