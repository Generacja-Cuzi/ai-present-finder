import {
  ChatStartInterviewEvent,
  ChatUserAnsweredEvent,
  StalkingAnalyzeRequestedEvent,
} from "@core/events";
import { ChatCompletedNotifyUserHandler } from "src/app/handlers/chat-completed-notify-user.handler";
import { ChatInappropriateRequestHandler } from "src/app/handlers/chat-inappropriate-request.handler";
import { ChatQuestionAskedHandler } from "src/app/handlers/chat-question-asked.handler";
import { GiftReadyHandler } from "src/app/handlers/gift-ready.handler";
import { NotifyUserSseHandler } from "src/app/handlers/notify-user-sse.handler";
import { SendUserMessageHandler } from "src/app/handlers/send-user-message.handler";
import { StartProcessingCommandHandler } from "src/app/handlers/start-processing.handler";
import { SseService } from "src/app/services/sse-service";

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
    ]),
  ],
  controllers: [
    RestApiController,
    ChatQuestionAskedHandler,
    ChatInappropriateRequestHandler,
    ChatCompletedNotifyUserHandler,
    GiftReadyHandler,
    SseController,
  ],
  providers: [
    StartProcessingCommandHandler,
    NotifyUserSseHandler,
    SendUserMessageHandler,
    SseService,
  ],
})
export class RestApiModule {}
