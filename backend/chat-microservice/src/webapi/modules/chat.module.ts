import {
  ChatCompletedNotifyUserEvent,
  ChatInappropriateRequestEvent,
  ChatInterviewCompletedEvent,
  ChatQuestionAskedEvent,
} from "@core/events";
import { ChatStartInterviewHandler } from "src/app/handlers/chat-start-interview.handler";
import { ChatUserAnsweredHandler } from "src/app/handlers/chat-user-answered.handler";
import { GenerateQuestionHandler } from "src/app/handlers/generate-question.handler";
import { GetOccasionHandler } from "src/app/handlers/get-occasion.handler";
import { SetOccasionHandler } from "src/app/handlers/set-occasion.handler";
import { ChatSession } from "src/domain/entities/chat-session.entity";

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "postgres" as const,
        host: configService.get<string>("DATABASE_HOST") ?? "localhost",
        port: Number.parseInt(
          configService.get<string>("DATABASE_PORT") ?? "6436",
          10,
        ),
        username: configService.get<string>("DATABASE_USERNAME") ?? "chat_user",
        password:
          configService.get<string>("DATABASE_PASSWORD") ?? "chat_password",
        database: configService.get<string>("DATABASE_NAME") ?? "chat_service",
        entities: [ChatSession],
        synchronize: true, // Only for development
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ChatSession]),
    ClientsModule.register([
      {
        name: "CHAT_QUESTION_ASKED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
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
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
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
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: ChatInappropriateRequestEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "CHAT_COMPLETED_NOTIFY_USER_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: ChatCompletedNotifyUserEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [ChatStartInterviewHandler, ChatUserAnsweredHandler],
  providers: [GenerateQuestionHandler, SetOccasionHandler, GetOccasionHandler],
})
export class ChatModule {}
