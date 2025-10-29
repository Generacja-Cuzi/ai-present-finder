// src/main.ts
import {
  ChatCompletedNotifyUserEvent,
  ChatInappropriateRequestEvent,
  ChatInterviewCompletedEvent,
  ChatQuestionAskedEvent,
  GiftReadyEvent,
} from "@core/events";
import * as cookieParser from "cookie-parser";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("AppLogger");

  app.use(cookieParser());

  const port = Number(process.env.PORT ?? 3000);
  const portString = String(port);
  const cloudAmqpUrl =
    process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672";

  // Build CORS allowed origins from environment or defaults
  const corsOrigins =
    (process.env.CORS_ORIGINS ?? "")
      ? (process.env.CORS_ORIGINS ?? "")
          .split(",")
          .map((origin) => origin.trim())
      : ["http://localhost:5713", "http://localhost:5173"];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  });

  const swaggerServer =
    process.env.SWAGGER_SERVER ?? `http://localhost:${portString}`;

  const config = new DocumentBuilder()
    .setTitle("AI Present Finder - REST API")
    .setDescription(
      "REST API for interacting with microservices: stalking requests, sending chat messages and streaming events via SSE.",
    )
    .setVersion("1.0")
    .addServer(swaggerServer)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputDirectory = "docs/openapi";
  if (!existsSync(outputDirectory)) {
    mkdirSync(outputDirectory, { recursive: true });
  }
  writeFileSync(
    `${outputDirectory}/restapi-macroservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "AI Present Finder — REST API Docs",
  });

  const chatQuestionAskedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [cloudAmqpUrl],
      queue: ChatQuestionAskedEvent.name,
      queueOptions: { durable: false },
    },
  };

  const giftReadyMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [cloudAmqpUrl],
      queue: GiftReadyEvent.name,
      queueOptions: { durable: false },
    },
  };

  const chatInappropriateRequestMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [cloudAmqpUrl],
      queue: ChatInappropriateRequestEvent.name,
      queueOptions: { durable: false },
    },
  };

  const chatCompletedNotifyUserMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [cloudAmqpUrl],
      queue: ChatCompletedNotifyUserEvent.name,
      queueOptions: { durable: false },
    },
  };

  app.connectMicroservice(chatQuestionAskedMicroserviceOptions);
  app.connectMicroservice(giftReadyMicroserviceOptions);
  app.connectMicroservice(chatInappropriateRequestMicroserviceOptions);
  app.connectMicroservice(chatCompletedNotifyUserMicroserviceOptions);

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`Microservice is listening on port ${portString}`);
}

void bootstrap();
