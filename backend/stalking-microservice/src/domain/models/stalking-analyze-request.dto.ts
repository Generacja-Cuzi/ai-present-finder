import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

export const stalkingAnalyzeRequestDtoSchema = z.object({
  facebookUrl: z.url().optional(),
  instagramUrl: z.url().optional(),
  tiktokUrl: z.url().optional(),
  youtubeUrl: z.url().optional(),
  xUrl: z.url().optional(),
  linkedinUrl: z.url().optional(),
  chatId: z.string(),
});

export type StalkingAnalyzeRequestDto = z.infer<
  typeof stalkingAnalyzeRequestDtoSchema
>;

export class StalkingAnalyzeRequestDtoDocument
  implements StalkingAnalyzeRequestDto
{
  @ApiProperty({
    type: String,
    format: "url",
    description: "Facebook profile URL",
    example: "https://facebook.com/example",
    required: false,
  })
  facebookUrl: string;

  @ApiProperty({
    type: String,
    format: "url",
    description: "Instagram profile URL",
    example: "https://instagram.com/example",
    required: false,
  })
  instagramUrl: string;

  @ApiProperty({
    type: String,
    format: "url",
    description: "TikTok profile URL",
    example: "https://tiktok.com/@example",
    required: false,
  })
  tiktokUrl: string;

  @ApiProperty({
    type: String,
    format: "url",
    description: "YouTube channel URL",
    example: "https://youtube.com/channel/ABC",
    required: false,
  })
  youtubeUrl: string;

  @ApiProperty({
    type: String,
    format: "url",
    description: "X (Twitter) profile URL",
    example: "https://x.com/example",
    required: false,
  })
  xUrl: string;

  @ApiProperty({
    type: String,
    format: "url",
    description: "LinkedIn profile URL",
    example: "https://linkedin.com/in/example",
    required: false,
  })
  linkedinUrl: string;

  @ApiProperty({
    type: String,
    description: "Chat identifier",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  chatId: string;
}
