import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AddProductsToSessionHandler } from "../app/handlers/add-products-to-session.handler";
import { CheckAndPrepareRegenerateIdeasLoopHandler } from "../app/handlers/check-and-prepare-regenerate-ideas-loop.handler";
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
import { getDatabaseConfig } from "../config/database.config";
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
  CheckAndPrepareRegenerateIdeasLoopHandler,
];

const QueryHandlers = [GetSessionProductsHandler, ScoreProductsHandler];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(
      getDatabaseConfig({
        migrations: ["dist/data/migrations/*.js"],
        migrationsRun: true,
      }),
    ),
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
      {
        name: "REGENERATE_IDEAS_LOOP_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: "RegenerateIdeasLoopEvent",
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [ProductFetchedHandler, GiftContextInitializedHandler],
  providers: [...CommandHandlers, ...QueryHandlers, TimeoutSchedulerService],
})
export class AppModule {}
