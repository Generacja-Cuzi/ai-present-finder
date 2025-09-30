import { ChatInappropriateRequestHandler } from "src/app/handlers/chat-inappropriate-request.handler";
import { ChatInterviewCompletedHandler } from "src/app/handlers/chat-interview-completed.handler";
import { ChatQuestionAskedHandler } from "src/app/handlers/chat-question-asked.handler";
import { EndInterviewCommandHandler } from "src/app/handlers/end-interview-command.handler";
import { EvaluateContextHandler } from "src/app/handlers/evaluate-context.handler";
import { GiftReadyHandler } from "src/app/handlers/gift-ready.handler";
import { NotifyUserSseHandler } from "src/app/handlers/notify-user-sse.handler";
import { SendUserMessageHandler } from "src/app/handlers/send-user-message.handler";
import { StalkingAnalyzeRequestHandler } from "src/app/handlers/stalking-analyze-request.handler";
import { StalkingCompletedHandler } from "src/app/handlers/stalking-completed.handler";
import { SseService } from "src/app/services/sse-service";
import { ChatStartInterviewEvent } from "src/domain/events/chat-start-interview.event";
import { ChatUserAnsweredEvent } from "src/domain/events/chat-user-answered.event";
import { GiftGenerateRequestedEvent } from "src/domain/events/gift-generate-requested.event";
import { StalkingAnalyzeRequestedEvent } from "src/domain/events/stalking-analyze-request.event";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { RestApiController } from "../controllers/restapi.controller";
import { SseController } from "../controllers/sse.controller";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
      {
        name: "CHAT_USER_ANSWERED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: ChatUserAnsweredEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "GIFT_GENERATE_REQUESTED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: GiftGenerateRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    RestApiController,
    StalkingCompletedHandler,
    ChatQuestionAskedHandler,
    ChatInterviewCompletedHandler,
    ChatInappropriateRequestHandler,
    GiftReadyHandler,
    SseController,
  ],
  providers: [
    StalkingAnalyzeRequestHandler,
    EvaluateContextHandler,
    NotifyUserSseHandler,
    SendUserMessageHandler,
    EndInterviewCommandHandler,
    SseService,
  ],
})
export class RestApiModule {}
