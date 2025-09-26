import { ApiProperty } from '@nestjs/swagger';

export class ContextDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    description: 'Keywords that describe the context',
    example: ['books', 'programming'],
  })
  keywords: string[];

  @ApiProperty({
    type: 'string',
    description: 'Unique chat identifier',
    example: 'b3d9f9f0-3c2b-4f9a-9c2a-0d1e2f3a4b5c',
  })
  chatId: string;
}
