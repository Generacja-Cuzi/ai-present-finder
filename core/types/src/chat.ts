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
  personal_info: {
    person_name?: string | null;
    relationship?: string | null;
    occasion?: string | null;
    age_range?: string | null;
  };
  lifestyle: {
    primary_hobbies?: string[] | null;
    daily_routine?: string | null;
    relaxation_methods?: string[] | null;
    work_style?: string | null;
  };
  preferences: {
    home_aesthetic?: string | null;
    valued_items?: string[] | null;
    favorite_beverages?: string[] | null;
    comfort_foods?: string[] | null;
  };
  media_interests: {
    favorite_books?: string[] | null;
    must_watch_shows?: string[] | null;
    podcasts?: string[] | null;
    music_preferences?: string[] | null;
  };
  recent_life: {
    new_experiences?: string[] | null;
    mentioned_needs?: string[] | null;
    recent_achievements?: string[] | null;
  };
  gift_context: {
    occasion_significance?: string | null;
    gift_message?: string | null;
    previous_gift_successes?: string[] | null;
  };
}

export interface EndConversationOutput {
  recipient_profile: RecipientProfile | null;
  key_themes_and_keywords: string[];
  save_profile?: boolean;
  profile_name?: string | null;
}
