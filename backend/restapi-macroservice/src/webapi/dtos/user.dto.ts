import { ApiProperty } from "@nestjs/swagger";

export class CurrentUserResponseDto {
  @ApiProperty({
    description: "User information",
  })
  user!: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

export class UserInfoDto {
  @ApiProperty({
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id!: string;

  @ApiProperty({
    description: "User email",
    example: "user@example.com",
  })
  email!: string;

  @ApiProperty({
    description: "User name",
    example: "John Doe",
    nullable: true,
    type: String,
  })
  name!: string | null;

  @ApiProperty({
    description: "User given name",
    example: "John",
    nullable: true,
    type: String,
  })
  givenName!: string | null;

  @ApiProperty({
    description: "User family name",
    example: "Doe",
    nullable: true,
    type: String,
  })
  familyName!: string | null;

  @ApiProperty({
    description: "User profile picture URL",
    example: "https://lh3.googleusercontent.com/a/example",
    nullable: true,
    type: String,
  })
  picture!: string | null;

  @ApiProperty({
    description: "User role",
    example: "user",
    enum: ["user", "admin"],
  })
  role!: string;
}
