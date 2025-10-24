import { ApiProperty } from "@nestjs/swagger";

import { ChatMessageWithAnswersDto } from "./chat-message.dto";
import { ListingWithIdDto } from "./listing.dto";

export const uiUpdateEvent = "ui-update";

export class SseChatbotMessageDto {
  @ApiProperty({ enum: ["chatbot-message"], example: "chatbot-message" })
  type!: "chatbot-message";

  @ApiProperty({
    type: ChatMessageWithAnswersDto,
    description: "Chat message from the bot",
    example: {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      content: "Hello!",
      sender: "user",
      potentialAnswers: {
        type: "select",
        answers: [
          {
            answerFullSentence: "Answer 1",
            answerShortForm: "Answer 1 short",
          },
        ],
      },
    },
  })
  message!: ChatMessageWithAnswersDto;
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
    type: ListingWithIdDto,
    isArray: true,
    description: "Gift ideas payload with listing IDs",
    example: {
      giftIdeas: [
        {
          listingId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          image: "https://example.com/image.jpg",
          title: "Book",
          description: "Great book",
          link: "https://example.com/book",
          price: {
            value: 10,
            label: "10 USD",
            currency: "USD",
            negotiable: false,
          },
        },
        {
          listingId: "4ga85f64-5717-4562-b3fc-2c963f66afa7",
          image: "https://example.com/image.jpg",
          title: "Pen",
          description: "Great pen",
          link: "https://example.com/pen",
          price: {
            value: 5,
            label: "5 USD",
            currency: "USD",
            negotiable: false,
          },
        },
      ],
    },
  })
  data!: ListingWithIdDto[];
}

export type SseMessageDto =
  | SseChatbotMessageDto
  | SseChatInterviewCompletedDto
  | SseChatInappropriateRequestDto
  | SseGiftReadyDto;

export type SseMessageType = SseMessageDto["type"];
