// src/main.ts
import { GiftContextInitializedEvent, ProductFetchedEvent } from "@core/events";
import { createRabbitMQConsumer } from "@core/rabbitmq-config";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./webapi/reranking.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("AppLogger");

  const port = Number(process.env.PORT ?? 3091);
  const portString = String(port);

  app.connectMicroservice(
    createRabbitMQConsumer({
      queue: ProductFetchedEvent.name,
      prefetchCount: 20,
    }),
  );

  app.connectMicroservice(
    createRabbitMQConsumer({
      queue: GiftContextInitializedEvent.name,
      prefetchCount: 10,
    }),
  );

  const swaggerServer =
    process.env.SWAGGER_SERVER ?? `http://localhost:${portString}`;

  const config = new DocumentBuilder()
    .setTitle("AI Present Finder - Reranking Microservice")
    .setDescription(
      "Endpoints for reranking and filtering gift recommendations.",
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
    `${outputDirectory}/reranking-microservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "AI Present Finder — Reranking Docs",
  });

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`Microservice is listening on port ${portString}`);
}

void bootstrap();
