import { z } from "zod";

export const endConversationOutputSchema = z.object({
  recipient_profile: z.array(z.string()),
  key_themes_and_keywords: z.array(z.string()),
  gift_recommendations: z.array(z.string()),
});

<<<<<<< HEAD
export type EndConversationOutput = z.infer<typeof endConversationOutputSchema>;
=======
export type EndConversationOutput = z.infer<typeof EndConversationOutput>;

import { ApiProperty } from '@nestjs/swagger';

export class EndConversationOutputDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['engineer', 'book lover'],
  })
  recipient_profile: string[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['programming', 'reading'],
  })
  key_themes_and_keywords: string[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['kindle', 'mechanical keyboard'],
  })
  gift_recommendations: string[];
}
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
