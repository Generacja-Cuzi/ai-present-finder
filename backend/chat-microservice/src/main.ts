// src/main.ts
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";

import { AppModule } from "./app.module";
import { ChatStartInterviewEvent } from "./domain/events/chat-start-interview.event";
import { ChatUserAnsweredEvent } from "./domain/events/chat-user-answered.event";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger("AppLogger");

  const chatAskQuestionMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: ChatStartInterviewEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const chatUserAnsweredMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: ChatUserAnsweredEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  app.connectMicroservice(chatAskQuestionMicroserviceOptions);
  app.connectMicroservice(chatUserAnsweredMicroserviceOptions);

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3020);

  logger.log("Microservice is listening");
}
void bootstrap();
