import { ApiProperty } from "@nestjs/swagger";

import { ChatMessageDto } from "./chat-message.dto";
import { ListingDto } from "./listing.dto";

export const uiUpdateEvent = "ui-update";

export class SseChatbotMessageDto {
  @ApiProperty({ enum: ["chatbot-message"], example: "chatbot-message" })
  type!: "chatbot-message";

  @ApiProperty({
    type: ChatMessageDto,
    description: "Chat message from the bot",
    example: {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      content: "Hello!",
      sender: "user",
    },
  })
  message!: ChatMessageDto;
}

export class SseChatInterviewCompletedDto {
  @ApiProperty({
    enum: ["chat-interview-completed"],
    example: "chat-interview-completed",
  })
  type!: "chat-interview-completed";
}

export class SseChatInappropriateRequestDto {
  @ApiProperty({
    enum: ["chat-inappropriate-request"],
    example: "chat-inappropriate-request",
  })
  type!: "chat-inappropriate-request";

  @ApiProperty({
    description: "Reason why the request was inappropriate",
    example: "inappropriate content",
  })
  reason!: string;
}

export class SseGiftReadyDto {
  @ApiProperty({ enum: ["gift-ready"], example: "gift-ready" })
  type!: "gift-ready";

  @ApiProperty({
    type: ListingDto,
    isArray: true,
    description: "Gift ideas payload",
    example: {
      giftIdeas: [
        {
          image: "https://example.com/image.jpg",
          title: "Book",
          description: "Great book",
          link: "https://example.com/book",
        },
        {
          image: "https://example.com/image.jpg",
          title: "Pen",
          description: "Great pen",
          link: "https://example.com/pen",
        },
      ],
    },
  })
  data!: ListingDto[];
}

export type SseMessageDto =
  | SseChatbotMessageDto
  | SseChatInterviewCompletedDto
  | SseChatInappropriateRequestDto
  | SseGiftReadyDto;

export type SseMessageType = SseMessageDto["type"];
