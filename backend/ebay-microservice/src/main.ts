// src/main.ts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { MicroserviceOptions } from "@nestjs/microservices";
import { Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  // Create HTTP app for Swagger docs
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("AppLogger");

  const port = Number(process.env.PORT ?? 3023);
  const portString = String(port);

  const swaggerServer =
    process.env.SWAGGER_SERVER ?? `http://localhost:${portString}`;

  const config = new DocumentBuilder()
    .setTitle("AI Present Finder - eBay Microservice")
    .setDescription(
      "Endpoints for searching eBay listings and retrieving product data.",
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
    `${outputDirectory}/ebay-microservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "AI Present Finder — eBay Docs",
  });

  await app.listen(port);

  logger.log(`eBay Microservice HTTP API is listening on port ${portString}`);

  // Create microservice for RabbitMQ events
  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.RMQ,
      options: {
        urls: [
          process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
        ],
        queue: "ebay_queue",
        queueOptions: {
          durable: false,
        },
      },
    });

  await microservice.listen();
  logger.log("eBay Microservice is listening for RabbitMQ events");
}
void bootstrap();
