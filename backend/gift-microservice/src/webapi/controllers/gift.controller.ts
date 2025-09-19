// src/webapi/controllers/order.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FetchOlxQuery } from 'src/domain/queries/fetch-olx.query';
import { FetchOlxDto } from 'src/domain/models/fetch-olx.dto';

@Controller('gift')
export class GiftController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('olx')
  async fetchOlxGet(@Query() q: FetchOlxDto) {
    return this.queryBus.execute(
      new FetchOlxQuery(q.query, q.limit ?? 40, q.offset ?? 0),
    );
  }

  @Post('olx')
  async fetchOlxPost(@Body() body: FetchOlxDto) {
    return this.queryBus.execute(
      new FetchOlxQuery(body.query, body.limit ?? 40, body.offset ?? 0),
    );
  }
}
