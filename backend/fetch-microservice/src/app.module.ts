import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { FetchAllegroHandler } from "./app/handlers/fetch-allegro.handler";
import { FetchAmazonHandler } from "./app/handlers/fetch-amazon.handler";
import { FetchEbayHandler } from "./app/handlers/fetch-ebay.handler";
import { FetchOlxHandler } from "./app/handlers/fetch-olx.handler";
import { ProductFetchedEvent } from "./domain/events/product-fetched.event";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: "PRODUCT_FETCHED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: ProductFetchedEvent.name,
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [
    FetchAllegroHandler,
    FetchAmazonHandler,
    FetchEbayHandler,
    FetchOlxHandler,
  ],
  providers: [],
})
export class AppModule {}
