import { GiftGenerateRequestedHandler } from "src/app/handlers/gift-generate-requested.handler";
import { GiftReadyEvent } from "src/domain/events/gift-ready.event";

import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { GiftNewController } from "../controllers/gift-new.controller";
import { GiftController } from "../controllers/gift.controller";

@Module({
  imports: [
    CqrsModule,
    HttpModule,
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
    ]),
  ],
  controllers: [
    GiftController,
    GiftNewController,
    GiftGenerateRequestedHandler,
  ],
  providers: [
    // Usunięte stare handlery, używamy HTTP komunikacji
  ],
})
export class GiftNewModule {}
