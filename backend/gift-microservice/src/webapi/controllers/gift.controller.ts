// src/webapi/controllers/order.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FetchOlxDtoDoc } from 'src/domain/models/fetch-olx.dto';
import { FetchEbayDtoDoc } from 'src/domain/models/fetch-ebay.dto';
import { FetchAmazonDtoDoc } from 'src/domain/models/fetch-amazon.dto';
import { ListingDtoDoc } from 'src/domain/models/listing.dto';

import { FetchOlxQuery } from 'src/domain/queries/fetch-olx.query';
import { FetchOlxDto } from 'src/domain/models/fetch-olx.dto';
import { FetchEbayQuery } from 'src/domain/queries/fetch-ebay.query';
import { FetchEbayDto } from 'src/domain/models/fetch-ebay.dto';
import { FetchAmazonQuery } from 'src/domain/queries/fetch-amazon.query';
import { FetchAmazonDto } from 'src/domain/models/fetch-amazon.dto';
import { ListingDto } from 'src/domain/models/listing.dto';
import { FetchAllegroQuery } from 'src/domain/queries/fetch-allegro.query';
import { FetchAllegroDto } from 'src/domain/models/fetch-allegro.dto';

@ApiExtraModels(
  FetchOlxDtoDoc,
  FetchEbayDtoDoc,
  FetchAmazonDtoDoc,
  ListingDtoDoc,
)
@ApiTags('gift')
@Controller('gift')
export class GiftController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('olx')
  @ApiOperation({ summary: 'Search OLX listings' })
  @ApiResponse({
    status: 200,
    description: 'List of listings',
    type: [ListingDtoDoc],
  })
  async fetchOlxGet(@Query() q: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(q.query, q.limit ?? 40, q.offset ?? 0),
    );
  }

  @Post('olx')
  @ApiOperation({ summary: 'Search OLX listings (POST)' })
  @ApiResponse({
    status: 200,
    description: 'List of listings',
    type: [ListingDtoDoc],
  })
  async fetchOlxPost(@Body() body: FetchOlxDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchOlxQuery(body.query, body.limit ?? 40, body.offset ?? 0),
    );
  }

  @Get('ebay')
  @ApiOperation({ summary: 'Search eBay listings' })
  @ApiResponse({
    status: 200,
    description: 'List of listings',
    type: [ListingDtoDoc],
  })
  async fetchEbayGet(@Query() q: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(q.query, q.limit ?? 20, q.offset ?? 0),
    );
  }

  @Post('ebay')
  @ApiOperation({ summary: 'Search eBay listings (POST)' })
  @ApiResponse({
    status: 200,
    description: 'List of listings',
    type: [ListingDtoDoc],
  })
  async fetchEbayPost(@Body() body: FetchEbayDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchEbayQuery(body.query, body.limit ?? 20, body.offset ?? 0),
    );
  }

  @Get('amazon')
  @ApiOperation({ summary: 'Search Amazon listings' })
  @ApiResponse({
    status: 200,
    description: 'List of listings',
    type: [ListingDtoDoc],
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

  @Post('amazon')
  @ApiOperation({ summary: 'Search Amazon listings (POST)' })
  @ApiResponse({
    status: 200,
    description: 'List of listings',
    type: [ListingDtoDoc],
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
  async fetchAllegroGet(@Query() q: FetchAllegroDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAllegroQuery(q.query, q.limit, q.offset),
    );
  }

  @Post("allegro")
  async fetchAllegroPost(@Body() body: FetchAllegroDto): Promise<ListingDto[]> {
    return this.queryBus.execute(
      new FetchAllegroQuery(body.query, body.limit, body.offset),
    );
  }
}
