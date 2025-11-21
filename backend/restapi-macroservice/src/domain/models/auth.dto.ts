import { ApiProperty } from "@nestjs/swagger";

import { UserRole } from "../entities/user.entity";

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

  @ApiProperty({
    description: "User given name",
    example: "John",
    nullable: true,
    type: String,
  })
  givenName: string | null;

  @ApiProperty({
    description: "User family name",
    example: "Doe",
    nullable: true,
    type: String,
  })
  familyName: string | null;

  @ApiProperty({
    description: "User profile picture URL",
    example: "https://lh3.googleusercontent.com/a/example",
    nullable: true,
    type: String,
  })
  picture: string | null;

  @ApiProperty({
    description: "User role",
    enum: UserRole,
    enumName: "UserRole",
    example: UserRole.USER,
  })
  role: UserRole;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "JWT refresh token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refreshToken: string;

  @ApiProperty({
    description: "User information",
    type: UserDto,
  })
  user: UserDto;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refreshToken: string;
}

export class GoogleAuthUrlDto {
  @ApiProperty({
    description: "Google OAuth authorization URL",
    example: "https://accounts.google.com/o/oauth2/v2/auth?...",
  })
  url: string;
}
