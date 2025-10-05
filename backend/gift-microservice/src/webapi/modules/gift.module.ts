import { GiftAllegroFetchedHandler } from "src/app/handlers/gift-allegro-fetched.handler";
import { GiftAmazonFetchedHandler } from "src/app/handlers/gift-amazon-fetched.handler";
import { GiftEbayFetchedHandler } from "src/app/handlers/gift-ebay-fetched.handler";
import { GiftGenerateRequestedHandler } from "src/app/handlers/gift-generate-requested.handler";
import { GiftOlxFetchedHandler } from "src/app/handlers/gift-olx-fetched.handler";
import { FetchAllegroRequestedEvent } from "src/domain/events/fetch-allegro-requested.event";
import { FetchAmazonRequestedEvent } from "src/domain/events/fetch-amazon-requested.event";
import { FetchEbayRequestedEvent } from "src/domain/events/fetch-ebay-requested.event";
import { FetchOlxRequestedEvent } from "src/domain/events/fetch-olx-requested.event";
import { GiftReadyEvent } from "src/domain/events/gift-ready.event";

import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { GiftController } from "../controllers/gift.controller";

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: "GIFT_READY_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: GiftReadyEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "FETCH_OLX_REQUESTED",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: FetchOlxRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "FETCH_ALLEGRO_REQUESTED",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: FetchAllegroRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "FETCH_AMAZON_REQUESTED",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: FetchAmazonRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "FETCH_EBAY_REQUESTED",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: FetchEbayRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    GiftController,
    GiftGenerateRequestedHandler,
    GiftAmazonFetchedHandler,
    GiftOlxFetchedHandler,
    GiftAllegroFetchedHandler,
    GiftEbayFetchedHandler,
  ],
  providers: [
    // Event-based communication, no direct query handlers needed
  ],
})
export class GiftModule {}
