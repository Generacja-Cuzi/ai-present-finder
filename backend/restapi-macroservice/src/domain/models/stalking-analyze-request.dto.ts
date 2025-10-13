import { ApiProperty } from "@nestjs/swagger";

export class StalkingAnalyzeRequestDto {
  @ApiProperty({
    description: "Instagram profile URL",
    example: "https://instagram.com/example",
    required: false,
  })
  instagramUrl: string;

  @ApiProperty({
    description: "TikTok profile URL",
    example: "https://tiktok.com/@example",
    required: false,
  })
  tiktokUrl: string;

  @ApiProperty({
    description: "X (Twitter) profile URL",
    example: "https://x.com/example",
    required: false,
  })
  xUrl: string;

  @ApiProperty({
    description: "Chat identifier",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  chatId: string;
}
