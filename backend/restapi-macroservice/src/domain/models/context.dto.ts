import { ApiProperty } from "@nestjs/swagger";

export class ContextDto {
  @ApiProperty({
    type: String,
    isArray: true,
    description: "Keywords describing the conversation",
    example: ["books", "travel"],
  })
  keywords: string[];

  @ApiProperty({
    type: String,
    description: "Unique chat identifier",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  chatId: string;
}
