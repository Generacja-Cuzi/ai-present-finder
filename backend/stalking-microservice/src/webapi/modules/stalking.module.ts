import { StalkingCompletedEvent } from "@core/events";
import { StalkingAnalyzeRequestHandler } from "src/app/handlers/stalking-analyze-request.handler";
import { StalkingAnalyzeHandler } from "src/app/handlers/stalking-analyze.handler";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { StalkingController } from "../controllers/stalking.controller";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: "STALKING_COMPLETED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: StalkingCompletedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [StalkingController, StalkingAnalyzeRequestHandler],
  providers: [StalkingAnalyzeHandler],
})
export class StalkingModule {}
