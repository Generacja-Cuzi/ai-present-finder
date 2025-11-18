import {
  ChatStartInterviewEvent,
  StalkingAnalyzeRequestedEvent,
} from "@core/events";
import { createRabbitMQPublisher } from "@core/rabbitmq-config";

import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { TerminusModule } from "@nestjs/terminus";

import { HealthController } from "../controllers/health.controller";

/**
 * Health check module.
 * Provides comprehensive health checks for database and RabbitMQ dependencies.
 */
@Module({
  imports: [
    TerminusModule,
    ClientsModule.register([
      createRabbitMQPublisher(
        "STALKING_ANALYZE_REQUESTED_EVENT",
        StalkingAnalyzeRequestedEvent.name,
      ),
      createRabbitMQPublisher(
        "CHAT_START_INTERVIEW_EVENT",
        ChatStartInterviewEvent.name,
      ),
    ]),
  ],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
