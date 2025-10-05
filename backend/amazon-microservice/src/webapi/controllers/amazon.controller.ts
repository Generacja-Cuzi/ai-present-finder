// src/webapi/controllers/amazon.controller.ts
import {
  FetchAmazonDto,
  FetchAmazonDtoDocument,
} from "src/domain/models/fetch-amazon.dto";
import { ListingDto, ListingDtoDocument } from "src/domain/models/listing.dto";
import { FetchAmazonQuery } from "src/domain/queries/fetch-amazon.query";

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

@ApiExtraModels(FetchAmazonDtoDocument, ListingDtoDocument)
@ApiTags("amazon")
@Controller("amazon")
export class AmazonController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "Search Amazon listings" })
  @ApiOkResponse({
    description: "List of Amazon listings",
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

  @Post()
  @ApiOperation({ summary: "Search Amazon listings (POST)" })
  @ApiOkResponse({
    description: "List of Amazon listings",
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
}
