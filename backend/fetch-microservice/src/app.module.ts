import { ProductFetchedEvent } from "@core/events";
import { createRabbitMQPublisher } from "@core/rabbitmq-config";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClientsModule } from "@nestjs/microservices";

import { FetchAllegroHandler } from "./app/handlers/fetch-allegro.handler";
import { FetchAmazonHandler } from "./app/handlers/fetch-amazon.handler";
import { FetchEbayHandler } from "./app/handlers/fetch-ebay.handler";
import { FetchOlxHandler } from "./app/handlers/fetch-olx.handler";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      createRabbitMQPublisher(
        "PRODUCT_FETCHED_EVENT",
        ProductFetchedEvent.name,
      ),
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
