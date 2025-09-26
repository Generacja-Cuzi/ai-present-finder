import z from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const fetchEbayDtoSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
});

export type FetchEbayDto = z.infer<typeof fetchEbayDtoSchema>;

export class FetchEbayDtoDoc implements FetchEbayDto {
  @ApiProperty({ description: 'Search query', example: 'vintage camera' })
  query: string;

  @ApiProperty({
    description: 'Max results to return',
    example: 20,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Offset for pagination',
    example: 0,
    required: false,
  })
  offset?: number;
}
