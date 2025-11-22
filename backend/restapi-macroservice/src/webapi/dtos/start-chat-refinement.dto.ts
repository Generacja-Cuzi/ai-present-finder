import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

export const startChatRefinementDtoSchema = z.object({
  selectedListingIds: z
    .array(z.uuid())
    .min(1, "Must select at least one listing")
    .max(20, "Cannot select more than 20 listings"),
});

export class StartChatRefinementDto {
  @ApiProperty({
    description: "Array of listing IDs that the user selected/liked",
    type: [String],
    example: [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
    ],
  })
  selectedListingIds: string[];
}

export class StartChatRefinementResponseDto {
  @ApiProperty({
    description: "Success message",
    example: "Refinement started successfully",
  })
  message: string;

  @ApiProperty({
    description: "Chat ID",
    example: "chat-123",
  })
  chatId: string;
}
