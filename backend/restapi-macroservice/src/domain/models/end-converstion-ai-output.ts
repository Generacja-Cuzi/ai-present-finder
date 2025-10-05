import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

export const endConversationOutputSchema = z.object({
  recipient_profile: z.array(z.string()),
  key_themes_and_keywords: z.array(z.string()),
  gift_recommendations: z.array(z.string()),
});

export type EndConversationOutput = z.infer<typeof endConversationOutputSchema>;

export class EndConversationOutputDocument implements EndConversationOutput {
  @ApiProperty({
    type: String,
    isArray: true,
    description: "Profile of the recipient",
    example: ["engineer", "book lover"],
  })
  recipient_profile: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    description: "LLM key themes and keywords",
    example: ["programming", "reading"],
  })
  key_themes_and_keywords: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    description: "LLM gift recommendations",
    example: ["fantasy book", "pen"],
  })
  gift_recommendations: string[];
}
