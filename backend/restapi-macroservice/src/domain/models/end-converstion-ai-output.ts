import { z } from "zod";

export const endConversationOutputSchema = z.object({
  recipient_profile: z.array(z.string()),
  key_themes_and_keywords: z.array(z.string()),
  gift_recommendations: z.array(z.string()),
});

export type EndConversationOutput = z.infer<typeof endConversationOutputSchema>;

import { ApiProperty } from '@nestjs/swagger';

export class EndConversationOutputDoc implements EndConversationOutput {
  @ApiProperty({ type: [String] })
  recipient_profile: string[];

  @ApiProperty({ type: [String] })
  key_themes_and_keywords: string[];

  @ApiProperty({ type: [String] })
  gift_recommendations: string[];
}
