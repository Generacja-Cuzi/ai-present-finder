// src/main.ts
import {
  ChatCompletedNotifyUserEvent,
  ChatInappropriateRequestEvent,
  ChatQuestionAskedEvent,
  GiftReadyEvent,
} from "@core/events";
import { createRabbitMQConsumer } from "@core/rabbitmq-config";
import * as cookieParser from "cookie-parser";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("AppLogger");

  app.use(cookieParser());

  const port = Number(process.env.PORT ?? 3000);
  const portString = String(port);

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

  app.connectMicroservice(
    createRabbitMQConsumer({
      queue: ChatQuestionAskedEvent.name,
      prefetchCount: 10,
    }),
  );
  app.connectMicroservice(
    createRabbitMQConsumer({
      queue: GiftReadyEvent.name,
      prefetchCount: 10,
    }),
  );
  app.connectMicroservice(
    createRabbitMQConsumer({
      queue: ChatInappropriateRequestEvent.name,
      prefetchCount: 10,
    }),
  );
  app.connectMicroservice(
    createRabbitMQConsumer({
      queue: ChatCompletedNotifyUserEvent.name,
      prefetchCount: 10,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`Microservice is listening on port ${portString}`);
}

void bootstrap();
