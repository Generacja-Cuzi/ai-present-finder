import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ReasoningSummaryDto } from "../../domain/models/chat.dto";
import { ListingResponseDto } from "./favorites.dto";

export class GetChatListingsDto {
  @ApiProperty({
    description: "Chat ID",
    example: "cm123abc",
  })
  chatId: string;
}

export class ChatInfoDto {
  @ApiProperty({
    description: "Chat ID",
    example: "cm123abc",
  })
  chatId: string;

  @ApiProperty({
    description: "Chat name",
    example: "Gift for Mom's Birthday",
  })
  chatName: string;

  @ApiPropertyOptional({
    description: "Reasoning summary with recipient profile and key themes",
    type: ReasoningSummaryDto,
  })
  reasoningSummary?: ReasoningSummaryDto | null;
}

export class ChatListingsResponseDto {
  @ApiProperty({
    description: "Chat information including reasoning summary",
    type: ChatInfoDto,
  })
  chat: ChatInfoDto;

  @ApiProperty({
    description: "List of listings for the chat",
    type: ListingResponseDto,
    isArray: true,
  })
  listings: ListingResponseDto[];
}
