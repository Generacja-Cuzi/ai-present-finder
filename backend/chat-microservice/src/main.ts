// src/main.ts
import { ChatStartInterviewEvent, ChatUserAnsweredEvent } from "@core/events";
import { createRabbitMQConsumer } from "@core/rabbitmq-config";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("AppLogger");

  const port = Number(process.env.PORT ?? 3020);
  const portString = String(port);

  app.connectMicroservice(
    createRabbitMQConsumer({
      queue: ChatStartInterviewEvent.name,
      prefetchCount: 10,
    }),
  );

  app.connectMicroservice(
    createRabbitMQConsumer({
      queue: ChatUserAnsweredEvent.name,
      prefetchCount: 10,
    }),
  );

  const swaggerServer =
    process.env.SWAGGER_SERVER ?? `http://localhost:${portString}`;

  const config = new DocumentBuilder()
    .setTitle("AI Present Finder - Chat Microservice")
    .setDescription(
      "Chat message endpoints and webhook-style endpoints used by the chat service.",
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
    `${outputDirectory}/chat-microservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "AI Present Finder — Chat Docs",
  });

  await app.startAllMicroservices();
  await app.listen(portString);

  logger.log(`Microservice is listening on port ${portString}`);
}

void bootstrap();
