import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserSseDto {
  @ApiProperty({
    description: 'Client identifier used to register for SSE',
    example: 'client-123',
  })
  clientId: string;
}
