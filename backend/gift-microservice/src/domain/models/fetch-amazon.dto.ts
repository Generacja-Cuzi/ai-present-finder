import { z } from "zod";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export const fetchAmazonDtoSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
  country: z.string().default("PL").optional(),
  page: z.number().min(1).default(1).optional(),
});

export type FetchAmazonDto = z.infer<typeof fetchAmazonDtoSchema>;

export class FetchAmazonDtoDocument implements FetchAmazonDto {
  @ApiProperty({
    type: String,
    description: "Search query",
    example: "board game",
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

  @ApiPropertyOptional({
    type: String,
    description: "Country code for Amazon site",
    example: "PL",
    required: false,
  })
  country?: string;

  @ApiPropertyOptional({
    type: Number,
    description: "Page number for Amazon results",
    example: 1,
    required: false,
  })
  page?: number;
}
