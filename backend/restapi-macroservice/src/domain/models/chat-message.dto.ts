import { ChatMessage } from "@core/types";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ChatMessageDto implements ChatMessage {
  @ApiProperty({
    description: "Unique message identifier",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  id!: string;

  @ApiProperty({
    description: "Message content",
    example: "Hello!",
  })
  content!: string;

  @ApiProperty({
    description: "Message sender",
    enum: ["user", "assistant"],
    example: "user",
  })
  sender!: "user" | "assistant";
}

export class PotencialAnswerChoiceDto {
  @ApiProperty({
    description: "Answer full sentence",
    example: "Answer 1",
  })
  answerFullSentence!: string;

  @ApiProperty({
    description: "Answer short form",
    example: "Short answer",
  })
  answerShortForm!: string;
}

export class PotencialAnswersSelectDto {
  @ApiProperty({
    description: "Type of potential answers",
    enum: ["select"],
    example: "select",
  })
  type!: "select";

  @ApiProperty({
    description: "Array of potential answers",
    type: PotencialAnswerChoiceDto,
    isArray: true,
  })
  answers!: PotencialAnswerChoiceDto[];
}

export class PotencialAnswersFreeTextDto {
  @ApiProperty({
    description: "Type of potential answers",
    enum: ["long_free_text"],
    example: "long_free_text",
  })
  type!: "long_free_text";
}

export class ChatMessageWithAnswersDto extends ChatMessageDto {
  @ApiPropertyOptional({
    description:
      "Potential answers - either select with 4 options or free text",
    oneOf: [
      { $ref: "#/components/schemas/PotencialAnswersSelectDto" },
      { $ref: "#/components/schemas/PotencialAnswersFreeTextDto" },
    ],
  })
  potentialAnswers?: PotencialAnswersSelectDto | PotencialAnswersFreeTextDto;
}
