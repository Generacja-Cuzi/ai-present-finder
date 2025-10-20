import { ApiProperty } from "@nestjs/swagger";

export class GoogleAuthDto {
  @ApiProperty({
    description: "Google OAuth authorization code",
    example: "4/0AY0e-g7...",
  })
  code: string;
}

export class UserDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User email",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "User name",
    example: "John Doe",
    nullable: true,
    type: String,
  })
  name: string | null;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "User information",
    type: UserDto,
  })
  user: UserDto;
}

export class GoogleAuthUrlDto {
  @ApiProperty({
    description: "Google OAuth authorization URL",
    example: "https://accounts.google.com/o/oauth2/v2/auth?...",
  })
  url: string;
}
