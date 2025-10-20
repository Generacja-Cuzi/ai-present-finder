import { ApiProperty } from "@nestjs/swagger";

import { ChatMessageDto } from "./chat-message.dto";

export class SendMessageDto {
  @ApiProperty({
    type: ChatMessageDto,
    isArray: true,
    description: "Messages in the conversation",
  })
  messages!: ChatMessageDto[];

  @ApiProperty({
    type: String,
    description: "Chat identifier",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  chatId!: string;
}
