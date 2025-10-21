import { ApiProperty } from "@nestjs/swagger";

import { ListingResponseDto } from "./favorites.dto";

export class GetChatListingsDto {
  @ApiProperty({
    description: "Chat ID",
    example: "cm123abc",
  })
  chatId: string;
}

export class ChatListingsResponseDto {
  @ApiProperty({
    description: "List of listings for the chat",
    type: ListingResponseDto,
    isArray: true,
  })
  listings: ListingResponseDto[];
}
