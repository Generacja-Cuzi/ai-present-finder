import {
  ChatStartInterviewEvent,
  StalkingAnalyzeRequestedEvent,
} from "@core/events";

import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TerminusModule } from "@nestjs/terminus";

import { RabbitMQHealthIndicator } from "../../app/health/rabbitmq.health";
import { HealthController } from "../controllers/health.controller";

/**
 * Health check module.
 * Provides comprehensive health checks for database and RabbitMQ dependencies.
 */
@Module({
  imports: [
    TerminusModule,
    ClientsModule.register([
      {
        name: "STALKING_ANALYZE_REQUESTED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: StalkingAnalyzeRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "CHAT_START_INTERVIEW_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: ChatStartInterviewEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [HealthController],
  providers: [RabbitMQHealthIndicator],
})
export class HealthModule {}
