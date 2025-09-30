// src/main.ts
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";

import { AppModule } from "./app.module";
import { ChatInappropriateRequestEvent } from "./domain/events/chat-innapropriate-request.event";
import { ChatInterviewCompletedEvent } from "./domain/events/chat-interview-completed.event";
import { ChatQuestionAskedEvent } from "./domain/events/chat-question-asked.event";
import { GiftReadyEvent } from "./domain/events/gift-ready.event";
import { StalkingCompletedEvent } from "./domain/events/stalking-completed.event";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend access
  app.enableCors({
    origin: ["http://localhost:5713", "http://localhost:5173"], // Vite dev server ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  });

  const logger = new Logger("AppLogger");

  const stalkingCompletedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: StalkingCompletedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const chatQuestionAskedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: ChatQuestionAskedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const chatAnswerProcessedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: ChatInterviewCompletedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const giftReadyMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: GiftReadyEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const chatInappropriateRequestMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: ChatInappropriateRequestEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  app.connectMicroservice(stalkingCompletedMicroserviceOptions);
  app.connectMicroservice(chatQuestionAskedMicroserviceOptions);
  app.connectMicroservice(chatAnswerProcessedMicroserviceOptions);
  app.connectMicroservice(giftReadyMicroserviceOptions);
  app.connectMicroservice(chatInappropriateRequestMicroserviceOptions);

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);

  logger.log("Microservice is listening");
}

void bootstrap();
