// src/webapi/controllers/ebay.controller.ts
import {
  FetchEbayDto,
  FetchEbayDtoDocument,
} from "src/domain/models/fetch-ebay.dto";
import { ListingDto, ListingDtoDocument } from "src/domain/models/listing.dto";
import { FetchEbayQuery } from "src/domain/queries/fetch-ebay.query";

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

@ApiExtraModels(FetchEbayDtoDocument, ListingDtoDocument)
@ApiTags("ebay")
@Controller("ebay")
export class EbayController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "Search eBay listings" })
  @ApiOkResponse({
    description: "List of eBay listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchEbayGet(@Query() q: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(q.query, q.limit ?? 20, q.offset ?? 0),
    );
  }

  @Post()
  @ApiOperation({ summary: "Search eBay listings (POST)" })
  @ApiOkResponse({
    description: "List of eBay listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchEbayPost(@Body() body: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(body.query, body.limit ?? 20, body.offset ?? 0),
    );
  }
}
