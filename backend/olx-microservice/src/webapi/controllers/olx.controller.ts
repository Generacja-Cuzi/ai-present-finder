// src/webapi/controllers/olx.controller.ts
import {
  FetchOlxDto,
  FetchOlxDtoDocument,
} from "src/domain/models/fetch-olx.dto";
import { ListingDto, ListingDtoDocument } from "src/domain/models/listing.dto";
import { FetchOlxQuery } from "src/domain/queries/fetch-olx.query";

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

@ApiExtraModels(FetchOlxDtoDocument, ListingDtoDocument)
@ApiTags("olx")
@Controller("olx")
export class OlxController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "Search OLX listings" })
  @ApiOkResponse({
    description: "List of OLX listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchOlxGet(@Query() q: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(q.query, q.limit ?? 40, q.offset ?? 0),
    );
  }

  @Post()
  @ApiOperation({ summary: "Search OLX listings (POST)" })
  @ApiOkResponse({
    description: "List of OLX listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchOlxPost(@Body() body: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(body.query, body.limit ?? 40, body.offset ?? 0),
    );
  }
}
