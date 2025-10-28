import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AddProductsToSessionHandler } from "../app/handlers/add-products-to-session.handler";
import { CreateSessionHandler } from "../app/handlers/create-session.handler";
import { GetSessionProductsHandler } from "../app/handlers/get-session-products.handler";
import { GiftContextInitializedHandler } from "../app/handlers/gift-context-initialized.handler";
import { IncrementSessionCompletionHandler } from "../app/handlers/increment-session-completion.handler";
import { InitializeGiftContextHandler } from "../app/handlers/initialize-gift-context.handler";
import { MarkTimeoutSessionsHandler } from "../app/handlers/mark-timeout-sessions.handler";
import { ProductFetchedHandler } from "../app/handlers/product-fetched.handler";
import { RerankAndEmitGiftReadyHandler } from "../app/handlers/rerank-and-emit-gift-ready.handler";
import { ScoreProductsHandler } from "../app/handlers/score-products.handler";
import { UpdateProductRatingsHandler } from "../app/handlers/update-product-ratings.handler";
import { TimeoutSchedulerService } from "../app/services/timeout-scheduler.service";
import { GiftSessionProduct } from "../domain/entities/gift-session-product.entity";
import { GiftSession } from "../domain/entities/gift-session.entity";
import { Product } from "../domain/entities/product.entity";

const CommandHandlers = [
  CreateSessionHandler,
  InitializeGiftContextHandler,
  AddProductsToSessionHandler,
  IncrementSessionCompletionHandler,
  RerankAndEmitGiftReadyHandler,
  MarkTimeoutSessionsHandler,
  UpdateProductRatingsHandler,
];

const QueryHandlers = [GetSessionProductsHandler, ScoreProductsHandler];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule,
    ScheduleModule.forRoot(),
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
            entities: [GiftSession, GiftSessionProduct, Product],
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
            configService.get<string>("DATABASE_PORT") ?? "6097",
            10,
          ),
          username:
            configService.get<string>("DATABASE_USERNAME") ?? "reranking_user",
          password:
            configService.get<string>("DATABASE_PASSWORD") ??
            "reranking_password",
          database:
            configService.get<string>("DATABASE_NAME") ?? "reranking_service",
          entities: [GiftSession, GiftSessionProduct, Product],
          synchronize: true, // Only for development
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([GiftSession, GiftSessionProduct, Product]),
    ClientsModule.register([
      {
        name: "GIFT_READY_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: "GiftReadyEvent",
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [ProductFetchedHandler, GiftContextInitializedHandler],
  providers: [...CommandHandlers, ...QueryHandlers, TimeoutSchedulerService],
})
export class AppModule {}
