import { FetchAllegroHandler } from "src/app/handlers/fetch-allegro.handler";
import { FetchAmazonHandler } from "src/app/handlers/fetch-amazon.handler";
import { FetchEbayHandler } from "src/app/handlers/fetch-ebay.handler";
import { FetchOlxHandler } from "src/app/handlers/fetch-olx.handler";
import { GiftGenerateRequestedHandler } from "src/app/handlers/gift-generate-requested.handler";
import { ProductFetchedHandler } from "src/app/handlers/product-fetched.handler";
import { EventTrackingService } from "src/app/services/event-tracking.service";
import { SessionCompletionService } from "src/app/services/session-completion.service";
import { TimeoutSchedulerService } from "src/app/services/timeout-scheduler.service";
import { GiftEvent } from "src/domain/entities/gift-event.entity";
import { GiftSession } from "src/domain/entities/gift-session.entity";
import { GiftReadyEvent } from "src/domain/events/gift-ready.event";

import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GiftController } from "../controllers/gift.controller";

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    TypeOrmModule.forFeature([GiftEvent, GiftSession]),
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
        name: "FETCH_ALLEGRO_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: "FetchAllegroEvent",
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "FETCH_AMAZON_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: "FetchAmazonEvent",
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "FETCH_EBAY_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: "FetchEbayEvent",
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "FETCH_OLX_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: "FetchOlxEvent",
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
    ProductFetchedHandler,
  ],
  providers: [
    FetchOlxHandler,
    FetchEbayHandler,
    FetchAmazonHandler,
    FetchAllegroHandler,
    EventTrackingService,
    TimeoutSchedulerService,
    SessionCompletionService,
  ],
})
export class GiftModule {}
