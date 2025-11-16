import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RecipientPersonalInfoDescriptionDto {
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
  ageRange?: string | null;
}

export class RecipientPossessionsDto {
  @ApiProperty({
    type: String,
    isArray: true,
    description: "Items the recipient already owns",
    example: ["wireless headphones", "coffee maker", "fitness tracker"],
  })
  what_already_has: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    description: "Items the recipient needs or would benefit from",
    example: ["ergonomic chair", "smart home device", "cooking tools"],
  })
  what_is_missing: string[];
}

export class RecipientProfileDto {
  @ApiProperty({
    type: RecipientPersonalInfoDescriptionDto,
    description: "Basic personal information about the gift recipient",
  })
  personalInfoDescription: RecipientPersonalInfoDescriptionDto;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Lifestyle description",
    example:
      "Works from home, enjoys gaming and coffee, prefers minimalist design",
  })
  lifestyleDescription?: string | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Preferences description",
    example:
      "Loves tech gadgets, prefers modern aesthetics, enjoys craft coffee",
  })
  preferencesDescription?: string | null;

  @ApiPropertyOptional({
    required: false,
    type: String,
    description: "Recent life events and experiences",
    example:
      "Recently started working remotely, experiencing back pain from poor posture",
  })
  recentLifeDescription?: string | null;

  @ApiProperty({
    type: RecipientPossessionsDto,
    description:
      "Information about what the recipient already has and what they need",
  })
  possessions: RecipientPossessionsDto;
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
