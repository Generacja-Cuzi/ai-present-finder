import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class RecipientPersonalInfoDescription {
  @ApiPropertyOptional({ nullable: true, type: String })
  relationship?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  occasion?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  ageRange?: string | null;
}

class RecipientPossessions {
  @ApiProperty({ type: String, isArray: true })
  what_already_has: string[];

  @ApiProperty({ type: String, isArray: true })
  what_is_missing: string[];
}

export class RecipientProfileDto {
  @ApiProperty({ type: RecipientPersonalInfoDescription })
  personalInfoDescription: RecipientPersonalInfoDescription;

  @ApiPropertyOptional({ nullable: true, type: String })
  lifestyleDescription?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  preferencesDescription?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  recentLifeDescription?: string | null;

  @ApiProperty({ type: RecipientPossessions })
  possessions: RecipientPossessions;
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
    type: String,
    isArray: true,
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
    type: UserProfileDto,
    isArray: true,
  })
  profiles: UserProfileDto[];
}
