import { ApiProperty } from "@nestjs/swagger";

class RecipientPersonalInfo {
  @ApiProperty({ required: false, nullable: true, type: String })
  person_name?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  relationship?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  occasion?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  age_range?: string | null;
}

class RecipientLifestyle {
  @ApiProperty({ required: false, nullable: true, type: [String] })
  primary_hobbies?: string[] | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  daily_routine?: string | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  relaxation_methods?: string[] | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  work_style?: string | null;
}

class RecipientPreferences {
  @ApiProperty({ required: false, nullable: true, type: String })
  home_aesthetic?: string | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  valued_items?: string[] | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  favorite_beverages?: string[] | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  comfort_foods?: string[] | null;
}

class RecipientMediaInterests {
  @ApiProperty({ required: false, nullable: true, type: [String] })
  favorite_books?: string[] | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  must_watch_shows?: string[] | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  podcasts?: string[] | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  music_preferences?: string[] | null;
}

class RecipientRecentLife {
  @ApiProperty({ required: false, nullable: true, type: [String] })
  new_experiences?: string[] | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  mentioned_needs?: string[] | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  recent_achievements?: string[] | null;
}

class RecipientGiftContext {
  @ApiProperty({ required: false, nullable: true, type: String })
  occasion_significance?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  gift_message?: string | null;

  @ApiProperty({ required: false, nullable: true, type: [String] })
  previous_gift_successes?: string[] | null;
}

export class RecipientProfileDto {
  @ApiProperty({ type: RecipientPersonalInfo })
  personal_info: RecipientPersonalInfo;

  @ApiProperty({ type: RecipientLifestyle })
  lifestyle: RecipientLifestyle;

  @ApiProperty({ type: RecipientPreferences })
  preferences: RecipientPreferences;

  @ApiProperty({ type: RecipientMediaInterests })
  media_interests: RecipientMediaInterests;

  @ApiProperty({ type: RecipientRecentLife })
  recent_life: RecipientRecentLife;

  @ApiProperty({ type: RecipientGiftContext })
  gift_context: RecipientGiftContext;
}

export class UserProfileDto {
  @ApiProperty({
    description: "Profile ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId: string;

  @ApiProperty({
    description: "Chat ID associated with this profile",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  chatId: string;

  @ApiProperty({
    description: "Name of the person",
    example: "Mother",
  })
  personName: string;

  @ApiProperty({
    description: "Recipient profile data",
    type: RecipientProfileDto,
  })
  profile: RecipientProfileDto;

  @ApiProperty({
    description: "Key themes and keywords",
    type: [String],
    example: ["cooking", "gardening", "relaxation"],
  })
  keyThemes: string[];

  @ApiProperty({
    description: "Profile creation date",
    example: "2023-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Profile last update date",
    example: "2023-01-01T00:00:00.000Z",
  })
  updatedAt: Date;
}

export class UserProfilesResponseDto {
  @ApiProperty({
    description: "List of user profiles",
    type: [UserProfileDto],
  })
  profiles: UserProfileDto[];
}
