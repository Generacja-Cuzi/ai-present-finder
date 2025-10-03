// src/main.ts
import { existsSync, mkdirSync, writeFileSync } from "fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { ChatInappropriateRequestEvent } from "./domain/events/chat-innapropriate-request.event";
import { ChatInterviewCompletedEvent } from "./domain/events/chat-interview-completed.event";
import { ChatQuestionAskedEvent } from "./domain/events/chat-question-asked.event";
import { GiftReadyEvent } from "./domain/events/gift-ready.event";
import { StalkingCompletedEvent } from "./domain/events/stalking-completed.event";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["http://localhost:5713", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  });

  const config = new DocumentBuilder()
    .setTitle("AI Present Finder - REST API")
    .setDescription(
      "REST API for interacting with microservices: stalking requests, sending chat messages and streaming events via SSE.",
    )
    .setVersion("1.0")
    .addServer(
      process.env.SWAGGER_SERVER ||
        `http://localhost:${process.env.PORT ?? 3000}`,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outDir = "docs/openapi";
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(
    `${outDir}/restapi-macroservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "AI Present Finder — REST API Docs",
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
