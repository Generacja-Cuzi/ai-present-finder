// src/webapi/modules/order.module.ts
import { ChatStartInterviewHandler } from "src/app/handlers/chat-start-interview.handler";
import { ChatUserAnsweredHandler } from "src/app/handlers/chat-user-answered.handler";
import { GenerateQuestionHandler } from "src/app/handlers/generate-question.handler";
import { ChatInappropriateRequestEvent } from "src/domain/events/chat-innapropriate-request.event";
import { ChatInterviewCompletedEvent } from "src/domain/events/chat-interview-completed.event";
import { ChatQuestionAskedEvent } from "src/domain/events/chat-question-asked.event";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { ChatController } from "../controllers/chat.controller";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: "CHAT_QUESTION_ASKED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL || "amqp://admin:admin@localhost:5672",
          ],
          queue: ChatQuestionAskedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "CHAT_INTERVIEW_COMPLETED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL || "amqp://admin:admin@localhost:5672",
          ],
          queue: ChatInterviewCompletedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "CHAT_INNAPPROPRIATE_REQUEST_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL || "amqp://admin:admin@localhost:5672",
          ],
          queue: ChatInappropriateRequestEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    ChatController,
    ChatStartInterviewHandler,
    ChatUserAnsweredHandler,
  ],
  providers: [GenerateQuestionHandler],
})
export class ChatModule {}
