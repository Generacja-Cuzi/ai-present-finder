// src/main.ts
import {
  ChatInterviewCompletedEvent,
  RegenerateIdeasLoopEvent,
  StalkingCompletedEvent,
} from "@core/events";
import { createRabbitMQConsumer } from "@core/rabbitmq-config";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("AppLogger");

  const port = Number(process.env.PORT ?? 3030);
  const portString = String(port);

  const stalkingCompletedMicroserviceOptions = createRabbitMQConsumer({
    queue: StalkingCompletedEvent.name,
    prefetchCount: 10,
  });

  const chatInterviewCompletedMicroserviceOptions = createRabbitMQConsumer({
    queue: ChatInterviewCompletedEvent.name,
    prefetchCount: 10,
  });

  const regenerateIdeasLoopMicroserviceOptions = createRabbitMQConsumer({
    queue: RegenerateIdeasLoopEvent.name,
    prefetchCount: 10,
  });

  app.connectMicroservice(stalkingCompletedMicroserviceOptions);
  app.connectMicroservice(chatInterviewCompletedMicroserviceOptions);
  app.connectMicroservice(regenerateIdeasLoopMicroserviceOptions);

  const swaggerServer =
    process.env.SWAGGER_SERVER ?? `http://localhost:${portString}`;

  const config = new DocumentBuilder()
    .setTitle("AI Present Finder - Gift Microservice")
    .setDescription(
      "Endpoints for searching gift listings across sources (OLX, eBay, Amazon).",
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
    `${outputDirectory}/gift-microservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "AI Present Finder — Gift Docs",
  });

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`Microservice is listening on port ${portString}`);
}

void bootstrap();
