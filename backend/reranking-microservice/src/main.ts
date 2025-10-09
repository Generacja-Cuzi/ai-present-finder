// src/main.ts
import { ProductFetchedEvent } from "@core/events";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("AppLogger");

  const port = Number(process.env.PORT ?? 3040);
  const portString = String(port);
  const cloudAmqpUrl =
    process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672";

  const productFetchedOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [cloudAmqpUrl],
      queue: ProductFetchedEvent.name,
      queueOptions: { durable: false },
    },
  };
  app.connectMicroservice(productFetchedOptions);
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
