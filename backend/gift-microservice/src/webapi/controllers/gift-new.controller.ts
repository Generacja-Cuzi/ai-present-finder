// src/webapi/controllers/gift-new.controller.ts
import { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";
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

import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Post, Query } from "@nestjs/common";
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
export class GiftNewController {
  private readonly olxServiceUrl =
    process.env.OLX_SERVICE_URL ?? "http://localhost:3020";
  private readonly allegroServiceUrl =
    process.env.ALLEGRO_SERVICE_URL ?? "http://localhost:3021";
  private readonly amazonServiceUrl =
    process.env.AMAZON_SERVICE_URL ?? "http://localhost:3022";
  private readonly ebayServiceUrl =
    process.env.EBAY_SERVICE_URL ?? "http://localhost:3023";

  constructor(private readonly httpService: HttpService) {}

  @Get("olx")
  @ApiOperation({ summary: "Search OLX listings" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchOlxGet(@Query() q: FetchOlxDto): Promise<ListingDto[]> {
    try {
      const response: AxiosResponse<ListingDto[]> = await firstValueFrom(
        this.httpService.get(`${this.olxServiceUrl}/olx`, { params: q }),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching OLX listings:", error);
      return [];
    }
  }

  @Post("olx")
  @ApiOperation({ summary: "Search OLX listings (POST)" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchOlxPost(@Body() body: FetchOlxDto): Promise<ListingDto[]> {
    try {
      const response: AxiosResponse<ListingDto[]> = await firstValueFrom(
        this.httpService.post(`${this.olxServiceUrl}/olx`, body),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching OLX listings:", error);
      return [];
    }
  }

  @Get("allegro")
  @ApiOperation({ summary: "Search Allegro listings" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAllegroGet(@Query() q: FetchAllegroDto): Promise<ListingDto[]> {
    try {
      const response: AxiosResponse<ListingDto[]> = await firstValueFrom(
        this.httpService.get(`${this.allegroServiceUrl}/allegro`, {
          params: q,
        }),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Allegro listings:", error);
      return [];
    }
  }

  @Post("allegro")
  @ApiOperation({ summary: "Search Allegro listings (POST)" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAllegroPost(@Body() body: FetchAllegroDto): Promise<ListingDto[]> {
    try {
      const response: AxiosResponse<ListingDto[]> = await firstValueFrom(
        this.httpService.post(`${this.allegroServiceUrl}/allegro`, body),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Allegro listings:", error);
      return [];
    }
  }

  @Get("amazon")
  @ApiOperation({ summary: "Search Amazon listings" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAmazonGet(@Query() q: FetchAmazonDto): Promise<ListingDto[]> {
    try {
      const response: AxiosResponse<ListingDto[]> = await firstValueFrom(
        this.httpService.get(`${this.amazonServiceUrl}/amazon`, { params: q }),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Amazon listings:", error);
      return [];
    }
  }

  @Post("amazon")
  @ApiOperation({ summary: "Search Amazon listings (POST)" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchAmazonPost(@Body() body: FetchAmazonDto): Promise<ListingDto[]> {
    try {
      const response: AxiosResponse<ListingDto[]> = await firstValueFrom(
        this.httpService.post(`${this.amazonServiceUrl}/amazon`, body),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Amazon listings:", error);
      return [];
    }
  }

  @Get("ebay")
  @ApiOperation({ summary: "Search eBay listings" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchEbayGet(@Query() q: FetchEbayDto): Promise<ListingDto[]> {
    try {
      const response: AxiosResponse<ListingDto[]> = await firstValueFrom(
        this.httpService.get(`${this.ebayServiceUrl}/ebay`, { params: q }),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching eBay listings:", error);
      return [];
    }
  }

  @Post("ebay")
  @ApiOperation({ summary: "Search eBay listings (POST)" })
  @ApiOkResponse({
    description: "List of listings",
    type: ListingDtoDocument,
    isArray: true,
  })
  async fetchEbayPost(@Body() body: FetchEbayDto): Promise<ListingDto[]> {
    try {
      const response: AxiosResponse<ListingDto[]> = await firstValueFrom(
        this.httpService.post(`${this.ebayServiceUrl}/ebay`, body),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching eBay listings:", error);
      return [];
    }
  }
}
