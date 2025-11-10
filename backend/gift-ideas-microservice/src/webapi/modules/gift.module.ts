import { GiftContextInitializedEvent } from "@core/events";
import { ChatInterviewCompletedHandler } from "src/app/handlers/chat-interview-completed.handler";
import { EmitFetchEventsHandler } from "src/app/handlers/emit-fetch-events.handler";
import { GenerateGiftIdeasHandler } from "src/app/handlers/generate-gift-ideas.handler";
import { RegenerateIdeasLoopHandler } from "src/app/handlers/regenerate-ideas-loop.handler";
import { StalkingCompletedHandler } from "src/app/handlers/stalking-completed.handler";
import { UpdateInterviewStatusHandler } from "src/app/handlers/update-interview-status.handler";
import { UpdateStalkingStatusHandler } from "src/app/handlers/update-stalking-status.handler";
import { getDatabaseConfig } from "src/config/database.config";
import { ChatSession } from "src/domain/entities/chat-session.entity";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(
      getDatabaseConfig({
        migrations: [
          "./dist/backend/gift-ideas-microservice/src/data/migrations/*.js",
        ],
        migrationsRun: true,
      }),
    ),
    TypeOrmModule.forFeature([ChatSession]),
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
      {
        name: "GIFT_CONTEXT_INITIALIZED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: GiftContextInitializedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    StalkingCompletedHandler,
    ChatInterviewCompletedHandler,
    RegenerateIdeasLoopHandler,
  ],
  providers: [
    GenerateGiftIdeasHandler,
    UpdateStalkingStatusHandler,
    UpdateInterviewStatusHandler,
    EmitFetchEventsHandler,
  ],
})
export class GiftModule {}
