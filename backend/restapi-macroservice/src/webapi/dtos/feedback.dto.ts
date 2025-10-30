import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFeedbackDto {
  @ApiProperty({
    description: "ID of the chat to provide feedback for",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  chatId: string;

  @ApiProperty({
    description: "Rating from 1 to 5",
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  rating: number;

  @ApiPropertyOptional({
    description: "Optional comment about the chat experience",
    example: "Great recommendations, very helpful!",
    nullable: true,
  })
  comment?: string | null;
}

export class FeedbackResponseDto {
  @ApiProperty({
    description: "Unique identifier of the feedback",
    example: "550e8400-e29b-41d4-a716-446655440001",
  })
  id: string;

  @ApiProperty({
    description: "ID of the chat this feedback is for",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  chatId: string;

  @ApiProperty({
    description: "ID of the user who provided the feedback",
    example: "550e8400-e29b-41d4-a716-446655440002",
  })
  userId: string;

  @ApiProperty({
    description: "Rating from 1 to 5",
    example: 5,
  })
  rating: number;

  @ApiPropertyOptional({
    description: "Optional comment about the chat experience",
    example: "Great recommendations, very helpful!",
    nullable: true,
  })
  comment: string | null;

  @ApiProperty({
    description: "When the feedback was created",
    example: "2023-12-01T10:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "When the feedback was last updated",
    example: "2023-12-01T10:00:00.000Z",
  })
  updatedAt: Date;
}
