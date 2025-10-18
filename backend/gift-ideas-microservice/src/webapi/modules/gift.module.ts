import { GiftContextInitializedEvent } from "@core/events";
import { ChatInterviewCompletedHandler } from "src/app/handlers/chat-interview-completed.handler";
import { GenerateGiftIdeasHandler } from "src/app/handlers/generate-gift-ideas.handler";
import { StalkingCompletedHandler } from "src/app/handlers/stalking-completed.handler";
import { UpdateInterviewStatusHandler } from "src/app/handlers/update-interview-status.handler";
import { UpdateStalkingStatusHandler } from "src/app/handlers/update-stalking-status.handler";
import { ChatSession } from "src/domain/entities/chat-session.entity";

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        // Parse DATABASE_URL if provided, otherwise fall back to individual vars
        const databaseUrl = configService.get<string>("DATABASE_URL") ?? "";

        if (databaseUrl.length > 0) {
          const url = new URL(databaseUrl);
          return {
            type: "postgres" as const,
            host: url.hostname,
            port: Number.parseInt(url.port, 10) || 5432,
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading '/'
            entities: [ChatSession],
            // Never enable in production; opt-in via env
            synchronize:
              configService.get<string>("TYPEORM_SYNCHRONIZE") === "true",
            logging: false,
          };
        }

        // Fallback to individual environment variables
        return {
          type: "postgres" as const,
          host: configService.get<string>("DATABASE_HOST") ?? "localhost",
          port: Number.parseInt(
            configService.get<string>("DATABASE_PORT") ?? "6096",
            10,
          ),
          username:
            configService.get<string>("DATABASE_USERNAME") ?? "gift_ideas_user",
          password:
            configService.get<string>("DATABASE_PASSWORD") ??
            "gift_ideas_password",
          database:
            configService.get<string>("DATABASE_NAME") ?? "gift_ideas_service",
          entities: [ChatSession],
          synchronize: true, // Only for development
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
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
  controllers: [StalkingCompletedHandler, ChatInterviewCompletedHandler],
  providers: [
    GenerateGiftIdeasHandler,
    UpdateStalkingStatusHandler,
    UpdateInterviewStatusHandler,
  ],
})
export class GiftModule {}
