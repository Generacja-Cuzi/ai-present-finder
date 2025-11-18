import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class StalkingAnalyzeRequestDto {
  @ApiPropertyOptional({
    type: String,
    format: "url",
    description: "Instagram profile URL",
    example: "https://instagram.com/example",
    required: false,
  })
  instagramUrl?: string;

  @ApiPropertyOptional({
    type: String,
    format: "url",
    description: "TikTok profile URL",
    example: "https://tiktok.com/@example",
    required: false,
  })
  tiktokUrl?: string;

  @ApiPropertyOptional({
    type: String,
    format: "url",
    description: "X (Twitter) profile URL",
    example: "https://x.com/example",
    required: false,
  })
  xUrl?: string;

  @ApiProperty({
    type: String,
    description: "Chat identifier",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  chatId: string;

  @ApiPropertyOptional({
    type: Number,
    description: "Minimum price for gift search (in PLN)",
    example: 50,
    required: false,
  })
  minPrice?: number;

  @ApiPropertyOptional({
    type: Number,
    description: "Maximum price for gift search (in PLN)",
    example: 200,
    required: false,
  })
  maxPrice?: number;
}
