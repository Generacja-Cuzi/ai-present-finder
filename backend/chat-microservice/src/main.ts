// src/main.ts
import { existsSync, mkdirSync, writeFileSync } from "fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

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

  const config = new DocumentBuilder()
    .setTitle("AI Present Finder - Chat Microservice")
    .setDescription(
      "Chat message endpoints and webhook-style endpoints used by the chat service.",
    )
    .setVersion("1.0")
    .addServer(
      process.env.SWAGGER_SERVER ||
        `http://localhost:${process.env.PORT ?? 3020}`,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outDir = "docs/openapi";
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(
    `${outDir}/chat-microservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "AI Present Finder — Chat Docs",
  });
  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3020);

  logger.log("Microservice is listening");
}
void bootstrap();
