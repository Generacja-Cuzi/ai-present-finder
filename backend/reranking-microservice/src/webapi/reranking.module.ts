import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AddProductsToSessionHandler } from "../app/handlers/add-products-to-session.handler";
import { CreateSessionHandler } from "../app/handlers/create-session.handler";
import { EmitGiftReadyHandler } from "../app/handlers/emit-gift-ready.handler";
import { GiftContextInitializedHandler } from "../app/handlers/gift-context-initialized.handler";
import { IncrementSessionCompletionHandler } from "../app/handlers/increment-session-completion.handler";
import { InitializeGiftContextHandler } from "../app/handlers/initialize-gift-context.handler";
import { MarkTimeoutSessionsHandler } from "../app/handlers/mark-timeout-sessions.handler";
import { ProductFetchedHandler } from "../app/handlers/product-fetched.handler";
import { TimeoutSchedulerService } from "../app/services/timeout-scheduler.service";
import { GiftSession } from "../domain/entities/gift-session.entity";

const CommandHandlers = [
  CreateSessionHandler,
  InitializeGiftContextHandler,
  AddProductsToSessionHandler,
  IncrementSessionCompletionHandler,
  EmitGiftReadyHandler,
  MarkTimeoutSessionsHandler,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "postgres" as const,
        host: configService.get<string>("DATABASE_HOST"),
        port: Number.parseInt(
          configService.get<string>("DATABASE_PORT") ?? "",
          10,
        ),
        username: configService.get<string>("DATABASE_USERNAME") ?? "",
        password: configService.get<string>("DATABASE_PASSWORD") ?? "",
        database: configService.get<string>("DATABASE_NAME") ?? "",
        entities: [GiftSession],
        synchronize: true, // Only for development
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([GiftSession]),
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
  providers: [...CommandHandlers, TimeoutSchedulerService],
})
export class AppModule {}
