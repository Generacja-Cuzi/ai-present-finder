import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFeedbackDto {
  @ApiProperty({
    description: "ID of the chat to provide feedback for",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  chatId!: string;

  @ApiProperty({
    description: "Rating from 1 to 5",
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  rating!: number;

  @ApiPropertyOptional({
    description: "Optional comment about the chat experience (max 50 words)",
    example: "Great recommendations, very helpful!",
    nullable: true,
    type: String,
  })
  comment?: string | null;

  @ApiPropertyOptional({
    description:
      "ID of the product this feedback is for (null for general feedback)",
    example: "550e8400-e29b-41d4-a716-446655440003",
    nullable: true,
    type: String,
  })
  productId?: string | null;

  @ApiPropertyOptional({
    description: "Whether this is general feedback for the entire search",
    example: false,
    default: false,
  })
  isGeneralFeedback?: boolean;
}

export class FeedbackResponseDto {
  @ApiProperty({
    description: "Unique identifier of the feedback",
    example: "550e8400-e29b-41d4-a716-446655440001",
  })
  id!: string;

  @ApiProperty({
    description: "ID of the chat this feedback is for",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  chatId!: string;

  @ApiProperty({
    description: "ID of the user who provided the feedback",
    example: "550e8400-e29b-41d4-a716-446655440002",
  })
  userId!: string;

  @ApiProperty({
    description: "Rating from 1 to 5",
    example: 5,
  })
  rating!: number;

  @ApiProperty({
    description: "Optional comment about the chat experience",
    example: "Great recommendations, very helpful!",
    nullable: true,
    required: false,
    type: String,
  })
  comment!: string | null;

  @ApiPropertyOptional({
    description: "ID of the product this feedback is for",
    example: "550e8400-e29b-41d4-a716-446655440003",
    nullable: true,
    type: String,
    required: false,
  })
  productId!: string | null;

  @ApiProperty({
    description: "Whether this is general feedback",
    example: false,
    type: Boolean,
    required: true,
  })
  isGeneralFeedback!: boolean;

  @ApiProperty({
    description: "When the feedback was created",
    example: "2023-12-01T10:00:00.000Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description: "When the feedback was last updated",
    example: "2023-12-01T10:00:00.000Z",
  })
  updatedAt!: Date;
}
