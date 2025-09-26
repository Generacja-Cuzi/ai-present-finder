import z from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const fetchOlxDtoSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(40).optional(),
  offset: z.number().min(0).default(0).optional(),
});

export type FetchOlxDto = z.infer<typeof fetchOlxDtoSchema>;

export class FetchOlxDtoDoc implements FetchOlxDto {
  @ApiProperty({ description: 'Search query', example: 'lego set' })
  query: string;

  @ApiProperty({
    description: 'Max results to return',
    example: 40,
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
