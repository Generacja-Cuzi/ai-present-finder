import { z } from "zod";

export const GiftGenerateRequestedDto = z.object({
  keywords: z.array(z.string().min(1).max(100)),
});
<<<<<<< HEAD
=======

export type GiftGenerateRequestedDto = z.infer<typeof GiftGenerateRequestedDto>;

import { ApiProperty } from '@nestjs/swagger';

export class GiftGenerateRequestedDtoDoc implements GiftGenerateRequestedDto {
  @ApiProperty({ type: [String], example: ['books', 'coding'] })
  keywords: string[];
}
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
