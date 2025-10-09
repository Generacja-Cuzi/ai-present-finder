// src/webapi/controllers/gift.controller.ts
import { FetchAllegroDto } from "src/domain/models/fetch-allegro.dto";
import {
  FetchAmazonDto,
  FetchAmazonDtoDocument,
} from "src/domain/models/fetch-amazon.dto";
import {
  FetchEbayDto,
  FetchEbayDtoDocument,
} from "src/domain/models/fetch-ebay.dto";
import {
  FetchOlxDto,
  FetchOlxDtoDocument,
} from "src/domain/models/fetch-olx.dto";
import { ListingDto, ListingDtoDocument } from "src/domain/models/listing.dto";
import { FetchAllegroQuery } from "src/domain/queries/fetch-allegro.query";
import { FetchAmazonQuery } from "src/domain/queries/fetch-amazon.query";
import { FetchEbayQuery } from "src/domain/queries/fetch-ebay.query";
import { FetchOlxQuery } from "src/domain/queries/fetch-olx.query";

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

@ApiExtraModels(
  FetchOlxDtoDocument,
  FetchEbayDtoDocument,
  FetchAmazonDtoDocument,
  ListingDtoDocument,
)
@ApiTags("gift")
@Controller("gift")
export class GiftController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("olx")
  @ApiOperation({ summary: "Search OLX listings" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchOlxGet(@Query() q: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(q.query, q.limit ?? 40, q.offset ?? 0),
    );
  }

  @Post("olx")
  @ApiOperation({ summary: "Search OLX listings (POST)" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchOlxPost(@Body() body: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(body.query, body.limit ?? 40, body.offset ?? 0),
    );
  }

  @Get("ebay")
  @ApiOperation({ summary: "Search eBay listings" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchEbayGet(@Query() q: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(q.query, q.limit ?? 20, q.offset ?? 0),
    );
  }

  @Post("ebay")
  @ApiOperation({ summary: "Search eBay listings (POST)" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchEbayPost(@Body() body: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(body.query, body.limit ?? 20, body.offset ?? 0),
    );
  }

  @Get("amazon")
  @ApiOperation({ summary: "Search Amazon listings" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAmazonGet(@Query() q: FetchAmazonDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAmazonQuery(
        q.query,
        q.limit ?? 20,
        q.offset ?? 0,
        q.country ?? "PL",
        q.page ?? 1,
      ),
    );
  }

  @Post("amazon")
  @ApiOperation({ summary: "Search Amazon listings (POST)" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAmazonPost(@Body() body: FetchAmazonDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAmazonQuery(
        body.query,
        body.limit ?? 20,
        body.offset ?? 0,
        body.country ?? "PL",
        body.page ?? 1,
      ),
    );
  }

  @Get("allegro")
  @ApiOperation({ summary: "Search Allegro listings" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAllegroGet(@Query() q: FetchAllegroDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAllegroQuery(q.query, q.limit, q.offset),
    );
  }

  @Post("allegro")
  @ApiOperation({ summary: "Search Allegro listings (POST)" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAllegroPost(@Body() body: FetchAllegroDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAllegroQuery(body.query, body.limit, body.offset),
    );
  }
}
