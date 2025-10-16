import { ApiProperty } from "@nestjs/swagger";

export class GoogleAuthDto {
  @ApiProperty({
    description: "Google OAuth authorization code",
    example: "4/0AY0e-g7...",
  })
  code: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "User information",
  })
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}
