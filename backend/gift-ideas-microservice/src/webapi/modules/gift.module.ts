import { GenerateGiftIdeasHandler } from "src/app/handlers/generate-gift-ideas.handler";
import { GiftGenerateRequestedHandler } from "src/app/handlers/gift-generate-requested.handler";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
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
  controllers: [GiftGenerateRequestedHandler],
  providers: [GenerateGiftIdeasHandler],
})
export class GiftModule {}
