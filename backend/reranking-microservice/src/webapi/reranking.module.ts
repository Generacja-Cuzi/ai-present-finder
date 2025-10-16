import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GiftContextInitializedHandler } from "../app/handlers/gift-context-initialized.handler";
import { ProductFetchedHandler } from "../app/handlers/product-fetched.handler";
import { EventTrackingService } from "../app/services/event-tracking.service";
import { SessionCompletionService } from "../app/services/session-completion.service";
import { TimeoutSchedulerService } from "../app/services/timeout-scheduler.service";
import { GiftSession } from "../domain/entities/gift-session.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
            entities: [GiftSession],
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
            configService.get<string>("DATABASE_PORT") ?? "5432",
            10,
          ),
          username:
            configService.get<string>("DATABASE_USERNAME") ?? "reranking_user",
          password:
            configService.get<string>("DATABASE_PASSWORD") ??
            "reranking_password",
          database:
            configService.get<string>("DATABASE_NAME") ?? "reranking_service",
          entities: [GiftSession],
          synchronize: true, // Only for development
          logging: false,
        };
      },
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
  providers: [
    EventTrackingService,
    SessionCompletionService,
    TimeoutSchedulerService,
  ],
})
export class AppModule {}
