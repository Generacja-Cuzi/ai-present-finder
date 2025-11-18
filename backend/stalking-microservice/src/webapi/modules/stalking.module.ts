import { StalkingCompletedEvent } from "@core/events";
import { createRabbitMQPublisher } from "@core/rabbitmq-config";
import { StalkingAnalyzeRequestHandler } from "src/app/handlers/stalking-analyze-request.handler";
import { StalkingAnalyzeHandler } from "src/app/handlers/stalking-analyze.handler";
import { BrightDataService } from "src/app/services/brightdata.service";
import { validate } from "src/webapi/config/environment.config";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule } from "@nestjs/microservices";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ClientsModule.register([
      createRabbitMQPublisher(
        "STALKING_COMPLETED_EVENT",
        StalkingCompletedEvent.name,
      ),
    ]),
  ],
  controllers: [StalkingAnalyzeRequestHandler],
  providers: [StalkingAnalyzeHandler, BrightDataService],
})
export class StalkingModule {}
