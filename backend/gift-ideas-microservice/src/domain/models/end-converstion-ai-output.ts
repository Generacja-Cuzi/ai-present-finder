import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

export const endConversationOuputSchema = z.object({
  recipient_profile: z.array(z.string()),
  key_themes_and_keywords: z.array(z.string()),
  gift_recommendations: z.array(z.string()),
});

export type EndConversationOutput = z.infer<typeof endConversationOuputSchema>;

export class EndConversationOutputDocument implements EndConversationOutput {
  @ApiProperty({
    type: String,
    isArray: true,
    example: ["engineer", "book lover"],
    description: "Profile of the recipient",
  })
  recipient_profile: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    example: ["technology", "books"],
    description: "LLM key themes and keywords",
  })
  key_themes_and_keywords: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    example: ["smartwatch", "book"],
    description: "LLM gift recommendations",
  })
  gift_recommendations: string[];
}
