import { ApiProperty } from "@nestjs/swagger";

class RecipientProfileDto {
  @ApiProperty({ required: false })
  personal_info?: {
    person_name?: string | null;
    relationship?: string | null;
    occasion?: string | null;
    age_range?: string | null;
  };

  @ApiProperty({ required: false })
  lifestyle?: {
    primary_hobbies?: string[] | null;
    daily_routine?: string | null;
    relaxation_methods?: string[] | null;
    work_style?: string | null;
  };

  @ApiProperty({ required: false })
  preferences?: {
    home_aesthetic?: string | null;
    valued_items?: string[] | null;
    favorite_beverages?: string[] | null;
    comfort_foods?: string[] | null;
  };

  @ApiProperty({ required: false })
  media_interests?: {
    favorite_books?: string[] | null;
    must_watch_shows?: string[] | null;
    podcasts?: string[] | null;
    music_preferences?: string[] | null;
  };

  @ApiProperty({ required: false })
  recent_life?: {
    new_experiences?: string[] | null;
    mentioned_needs?: string[] | null;
    recent_achievements?: string[] | null;
  };

  @ApiProperty({ required: false })
  gift_context?: {
    occasion_significance?: string | null;
    gift_message?: string | null;
    previous_gift_successes?: string[] | null;
  };
}

class ReasoningSummaryDto {
  @ApiProperty({
    description: "Recipient profile with detailed information",
    required: false,
    type: RecipientProfileDto,
  })
  recipientProfile?: RecipientProfileDto;

  @ApiProperty({
    description: "Key themes and keywords from the interview",
    required: false,
    type: [String],
    example: ["tech", "outdoor activities", "coffee lover"],
  })
  keyThemesAndKeywords?: string[];
}

export class ChatDto {
  @ApiProperty({
    description: "Chat ID",
    example: "cm123abc",
  })
  chatId: string;

  @ApiProperty({
    description: "Chat name",
    example: "Gift for Mom",
  })
  chatName: string;

  @ApiProperty({
    description: "Created at timestamp",
    example: "2025-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Whether the chat interview has been completed",
    example: false,
  })
  isInterviewCompleted: boolean;
  @ApiProperty({
    description: "Number of gifts in the chat",
    example: 3,
  })
  giftCount: number;

  @ApiProperty({
    description: "Summary of the reasoning behind gift suggestions",
    required: false,
    type: ReasoningSummaryDto,
  })
  reasoningSummary?: ReasoningSummaryDto | null;
}

export class ChatsResponseDto {
  @ApiProperty({
    description: "List of user's chats",
    type: ChatDto,
    isArray: true,
  })
  chats: ChatDto[];
}
