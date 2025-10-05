import { z } from "zod";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export const fetchEbayDtoSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
});

export type FetchEbayDto = z.infer<typeof fetchEbayDtoSchema>;

export class FetchEbayDtoDocument implements FetchEbayDto {
  @ApiProperty({
    type: String,
    description: "Search query",
    example: "vintage camera",
  })
  query: string;

  @ApiPropertyOptional({
    type: Number,
    description: "Max results to return",
    example: 20,
    required: false,
  })
  limit?: number;

  @ApiPropertyOptional({
    type: Number,
    description: "Offset for pagination",
    example: 0,
    required: false,
  })
  offset?: number;
}
