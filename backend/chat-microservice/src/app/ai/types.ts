import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

export const endConversationOutputSchema = z.object({
  recipient_profile: z.array(z.string()),
  key_themes_and_keywords: z.array(z.string()),
  gift_recommendations: z.array(z.string()),
});

export type EndConversationOutput = z.infer<typeof endConversationOutputSchema>;

export class EndConversationOutputDocument {
  @ApiProperty({
    type: String,
    isArray: true,
    example: ["engineer", "book lover"],
  })
  recipient_profile!: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    example: ["programming", "reading"],
  })
  key_themes_and_keywords!: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    example: ["kindle", "mechanical keyboard"],
  })
  gift_recommendations!: string[];
}
