import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

export const giftGenerateRequestedDtoSchema = z.object({
  keywords: z.array(z.string().min(1).max(100)),
});

export type GiftGenerateRequestedDto = z.infer<
  typeof giftGenerateRequestedDtoSchema
>;

export class GiftGenerateRequestedDtoDocument
  implements GiftGenerateRequestedDto
{
  @ApiProperty({
    type: String,
    isArray: true,
    description: "Keywords for gift generation",
    example: ["books", "coding"],
  })
  keywords: string[];
}
