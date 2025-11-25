import { Controller, Get, Query } from '@nestjs/common';
import { AppService, ScrapeOkazjeResult } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('scrapeOkazje')
  async scrapeOkazje(@Query('q') query: string): Promise<ScrapeOkazjeResult> {
    return await this.appService.scrapeOkazje(query);
  }
}
