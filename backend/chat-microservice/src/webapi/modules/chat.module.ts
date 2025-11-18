import {
  ChatCompletedNotifyUserEvent,
  ChatInappropriateRequestEvent,
  ChatInterviewCompletedEvent,
  ChatQuestionAskedEvent,
} from "@core/events";
import { createRabbitMQPublisher } from "@core/rabbitmq-config";
import { ChatStartInterviewHandler } from "src/app/handlers/chat-start-interview.handler";
import { ChatUserAnsweredHandler } from "src/app/handlers/chat-user-answered.handler";
import { GenerateQuestionHandler } from "src/app/handlers/generate-question.handler";
import { GetOccasionHandler } from "src/app/handlers/get-occasion.handler";
import { SetOccasionHandler } from "src/app/handlers/set-occasion.handler";
import { getDatabaseConfig } from "src/config/database.config";
import { ChatSession } from "src/domain/entities/chat-session.entity";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(
      getDatabaseConfig({
        migrations: [
          "./dist/backend/chat-microservice/src/data/migrations/*.js",
        ],
        migrationsRun: true,
      }),
    ),
    TypeOrmModule.forFeature([ChatSession]),
    ClientsModule.register([
      createRabbitMQPublisher(
        "CHAT_QUESTION_ASKED_EVENT",
        ChatQuestionAskedEvent.name,
      ),
      createRabbitMQPublisher(
        "CHAT_INTERVIEW_COMPLETED_EVENT",
        ChatInterviewCompletedEvent.name,
      ),
      createRabbitMQPublisher(
        "CHAT_INNAPPROPRIATE_REQUEST_EVENT",
        ChatInappropriateRequestEvent.name,
      ),
      createRabbitMQPublisher(
        "CHAT_COMPLETED_NOTIFY_USER_EVENT",
        ChatCompletedNotifyUserEvent.name,
      ),
    ]),
  ],
  controllers: [ChatStartInterviewHandler, ChatUserAnsweredHandler],
  providers: [GenerateQuestionHandler, SetOccasionHandler, GetOccasionHandler],
})
export class ChatModule {}
