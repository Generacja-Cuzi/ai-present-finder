// src/webapi/controllers/order.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { FetchOlxQuery } from 'src/domain/queries/fetch-olx.query';
import { FetchOlxDto } from 'src/domain/models/fetch-olx.dto';
import { FetchEbayQuery } from 'src/domain/queries/fetch-ebay.query';
import { FetchEbayDto } from 'src/domain/models/fetch-ebay.dto';
import { ListingDto } from 'src/domain/models/listing.dto';

@Controller('gift')
export class GiftController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('olx')
  async fetchOlxGet(@Query() q: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(q.query, q.limit ?? 40, q.offset ?? 0),
    );
  }

  @Post('olx')
  async fetchOlxPost(@Body() body: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(body.query, body.limit ?? 40, body.offset ?? 0),
    );
  }

  @Get('ebay')
  async fetchEbayGet(@Query() q: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(q.query, q.limit ?? 20, q.offset ?? 0),
    );
  }

  @Post('ebay')
  async fetchEbayPost(@Body() body: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(body.query, body.limit ?? 20, body.offset ?? 0),
    );
  }
}
