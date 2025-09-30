// src/webapi/controllers/order.controller.ts
import { FetchAllegroDto } from "src/domain/models/fetch-allegro.dto";
import { FetchAmazonDto } from "src/domain/models/fetch-amazon.dto";
import { FetchEbayDto } from "src/domain/models/fetch-ebay.dto";
import { FetchOlxDto } from "src/domain/models/fetch-olx.dto";
import { ListingDto } from "src/domain/models/listing.dto";
import { FetchAllegroQuery } from "src/domain/queries/fetch-allegro.query";
import { FetchAmazonQuery } from "src/domain/queries/fetch-amazon.query";
import { FetchEbayQuery } from "src/domain/queries/fetch-ebay.query";
import { FetchOlxQuery } from "src/domain/queries/fetch-olx.query";

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";

@Controller("gift")
export class GiftController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("olx")
  async fetchOlxGet(@Query() q: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(q.query, q.limit ?? 40, q.offset ?? 0),
    );
  }

  @Post("olx")
  async fetchOlxPost(@Body() body: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(body.query, body.limit ?? 40, body.offset ?? 0),
    );
  }

  @Get("ebay")
  async fetchEbayGet(@Query() q: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(q.query, q.limit ?? 20, q.offset ?? 0),
    );
  }

  @Post("ebay")
  async fetchEbayPost(@Body() body: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(body.query, body.limit ?? 20, body.offset ?? 0),
    );
  }

  @Get("amazon")
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
  async fetchAllegroGet(@Query() q: FetchAllegroDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAllegroQuery(q.query, q.limit ?? 20, q.offset ?? 0),
    );
  }

  @Post("allegro")
  async fetchAllegroPost(@Body() body: FetchAllegroDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAllegroQuery(body.query, body.limit ?? 20, body.offset ?? 0),
    );
  }
}
