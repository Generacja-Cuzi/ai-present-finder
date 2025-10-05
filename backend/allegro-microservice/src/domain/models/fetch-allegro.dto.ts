import { z } from "zod";

import {
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger/dist/decorators/api-property.decorator";

export const fetchAllegroDtoSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type FetchAllegroDto = z.infer<typeof fetchAllegroDtoSchema>;

export class FetchAllegroDtoDocument implements FetchAllegroDto {
  @ApiProperty({
    type: String,
    description: "Search query",
    example: "smartphone",
  })
  query: string;

  @ApiPropertyOptional({
    type: Number,
    description: "Number of results to return",
    example: 20,
  })
  limit?: number;

  @ApiPropertyOptional({
    type: Number,
    description: "Number of results to skip",
    example: 0,
  })
  offset?: number;
}
