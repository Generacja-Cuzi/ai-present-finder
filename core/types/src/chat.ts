export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  proposedAnswers?: {
    type: "select" | "long_free_text";
    answers?: {
      answerFullSentence: string;
      answerShortForm: string;
    }[];
  };
}

export interface RecipientProfile {
  personalInfoDescription: {
    relationship?: string | null;
    occasion?: string | null;
    ageRange?: string | null;
  };
  lifestyleDescription?: string | null;
  preferencesDescription?: string | null;
  recentLifeDescription?: string | null;
  possessions: {
    what_already_has: string[];
    what_is_missing: string[];
  };
}

export interface EndConversationOutput {
  recipient_profile: RecipientProfile | null;
  key_themes_and_keywords: string[];
  save_profile?: boolean;
  profile_name?: string | null;
}
