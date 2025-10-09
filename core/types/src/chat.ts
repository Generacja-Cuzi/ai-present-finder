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

export interface ContextDto {
  keywords: string[];
  chatId: string;
}
