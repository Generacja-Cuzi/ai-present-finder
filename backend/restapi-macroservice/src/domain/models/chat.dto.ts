import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PersonalInfoDto {
  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Name of the person receiving the gift",
    example: "John Doe",
  })
  person_name?: string | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Relationship to the gift recipient",
    example: "brother",
  })
  relationship?: string | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Occasion for the gift",
    example: "birthday",
  })
  occasion?: string | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Age range of the gift recipient",
    example: "25-35",
  })
  age_range?: string | null;
}

export class LifestyleDto {
  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Primary hobbies and interests",
    example: ["reading", "hiking", "cooking"],
  })
  primary_hobbies?: string[] | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Daily routine description",
    example: "Early riser, works from home, enjoys evening walks",
  })
  daily_routine?: string | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Methods used for relaxation",
    example: ["meditation", "listening to music", "gardening"],
  })
  relaxation_methods?: string[] | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Work style and environment preferences",
    example: "Creative, prefers flexible hours, enjoys collaborative work",
  })
  work_style?: string | null;
}

export class PreferencesDto {
  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Home aesthetic and decor preferences",
    example: "Minimalist, warm colors, natural materials",
  })
  home_aesthetic?: string | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Items that hold sentimental or practical value",
    example: ["family photos", "coffee maker", "books"],
  })
  valued_items?: string[] | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Favorite beverages",
    example: ["coffee", "green tea", "craft beer"],
  })
  favorite_beverages?: string[] | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Comfort foods and favorite dishes",
    example: ["pasta", "chocolate", "homemade soup"],
  })
  comfort_foods?: string[] | null;
}

export class MediaInterestsDto {
  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Favorite books or authors",
    example: ["fiction novels", "biographies", "science fiction"],
  })
  favorite_books?: string[] | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "TV shows or movies that must be watched",
    example: ["Breaking Bad", "The Office", "Star Wars series"],
  })
  must_watch_shows?: string[] | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Favorite podcasts",
    example: ["Tech podcasts", "true crime", "science discussions"],
  })
  podcasts?: string[] | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Music genres and preferences",
    example: ["indie rock", "jazz", "electronic music"],
  })
  music_preferences?: string[] | null;
}

export class RecentLifeDto {
  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Recent new experiences or life changes",
    example: [
      "started a new job",
      "moved to a new city",
      "learned a new skill",
    ],
  })
  new_experiences?: string[] | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Needs or challenges mentioned during conversation",
    example: [
      "needs better organization tools",
      "wants to improve fitness",
      "looking for cooking inspiration",
    ],
  })
  mentioned_needs?: string[] | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Recent achievements or accomplishments",
    example: ["completed a marathon", "got promoted", "published an article"],
  })
  recent_achievements?: string[] | null;
}

export class GiftContextDto {
  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Significance or importance of the occasion",
    example: "First birthday after graduation, very important milestone",
  })
  occasion_significance?: string | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Personal message to include with the gift",
    example: "Happy Birthday! Can't wait to celebrate with you.",
  })
  gift_message?: string | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Previous gifts that were successful or well-received",
    example: [
      "coffee subscription",
      "wireless headphones",
      "cooking class voucher",
    ],
  })
  previous_gift_successes?: string[] | null;
}

export class RecipientProfileDto {
  @ApiPropertyOptional({
    required: false,
    type: PersonalInfoDto,
    description: "Basic personal information about the gift recipient",
  })
  personal_info?: PersonalInfoDto;

  @ApiPropertyOptional({
    required: false,
    type: LifestyleDto,
    description: "Lifestyle preferences and daily habits",
  })
  lifestyle?: LifestyleDto;

  @ApiPropertyOptional({
    required: false,
    type: PreferencesDto,
    description: "Personal preferences and tastes",
  })
  preferences?: PreferencesDto;

  @ApiPropertyOptional({
    required: false,
    type: MediaInterestsDto,
    description: "Media and entertainment interests",
  })
  media_interests?: MediaInterestsDto;

  @ApiPropertyOptional({
    required: false,
    type: RecentLifeDto,
    description: "Recent life events and experiences",
  })
  recent_life?: RecentLifeDto;

  @ApiPropertyOptional({
    required: false,
    type: GiftContextDto,
    description: "Context and details about the gift occasion",
  })
  gift_context?: GiftContextDto;
}

export class ReasoningSummaryDto {
  @ApiPropertyOptional({
    description: "Recipient profile with detailed information",
    type: RecipientProfileDto,
  })
  recipientProfile?: RecipientProfileDto;

  @ApiPropertyOptional({
    description: "Key themes and keywords from the interview",
    type: String,
    isArray: true,
    example: ["tech", "outdoor activities", "coffee lover"],
  })
  keyThemesAndKeywords?: string[];
}

export class ChatDto {
  @ApiProperty({
    description: "Unique identifier for the chat",
    example: "cm123abc",
    type: String,
  })
  chatId: string;

  @ApiProperty({
    description: "Display name for the chat session",
    example: "Gift for Mom",
    type: String,
  })
  chatName: string;

  @ApiProperty({
    description: "Timestamp when the chat was created",
    example: "2025-01-15T10:30:00Z",
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description:
      "Indicates whether the gift interview process has been completed",
    example: false,
    type: Boolean,
  })
  isInterviewCompleted: boolean;

  @ApiProperty({
    description: "Total number of gift suggestions generated in this chat",
    example: 3,
    type: Number,
  })
  giftCount: number;

  @ApiPropertyOptional({
    description: "Summary of the reasoning behind gift suggestions",
    type: ReasoningSummaryDto,
    required: false,
  })
  reasoningSummary?: ReasoningSummaryDto | null;
}

export class ChatsResponseDto {
  @ApiProperty({
    description: "Array of chat sessions belonging to the user",
    type: ChatDto,
    isArray: true,
    example: [
      {
        chatId: "cm123abc",
        chatName: "Gift for Mom",
        createdAt: "2025-01-15T10:30:00Z",
        isInterviewCompleted: false,
        giftCount: 3,
      },
    ],
  })
  chats: ChatDto[];
}
