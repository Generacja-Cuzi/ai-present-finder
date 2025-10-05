// src/webapi/controllers/allegro.controller.ts
import { FetchAllegroDto } from "src/domain/models/fetch-allegro.dto";
import { ListingDto, ListingDtoDocument } from "src/domain/models/listing.dto";
import { FetchAllegroQuery } from "src/domain/queries/fetch-allegro.query";

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

@ApiExtraModels(ListingDtoDocument)
@ApiTags("allegro")
@Controller("allegro")
export class AllegroController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "Search Allegro listings" })
  @ApiOkResponse({
    description: "List of Allegro listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAllegroGet(@Query() q: FetchAllegroDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAllegroQuery(q.query, q.limit, q.offset),
    );
  }

  @Post()
  @ApiOperation({ summary: "Search Allegro listings (POST)" })
  @ApiOkResponse({
    description: "List of Allegro listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAllegroPost(@Body() body: FetchAllegroDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAllegroQuery(body.query, body.limit, body.offset),
    );
  }
}
