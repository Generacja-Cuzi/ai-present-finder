import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

export const contextDtoSchema = z.object({
  keywords: z.array(z.string()),
  chatId: z.string(),
});

export type ContextDto = z.infer<typeof contextDtoSchema>;

export class ContextDtoDocument implements ContextDto {
  @ApiProperty({
    type: String,
    isArray: true,
    description: "Keywords that describe the context",
    example: ["books", "programming"],
  })
  keywords: string[];

  @ApiProperty({
    type: String,
    description: "Unique chat identifier",
    example: "b3d9f9f0-3c2b-4f9a-9c2a-0d1e2f3a4b5c",
  })
  chatId: string;
}
