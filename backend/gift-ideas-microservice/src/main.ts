// src/main.ts
import {
  ChatInterviewCompletedEvent,
  StalkingCompletedEvent,
} from "@core/events";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("AppLogger");

  const port = Number(process.env.PORT ?? 3030);
  const portString = String(port);
  const cloudAmqpUrl =
    process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672";

  const stalkingCompletedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [cloudAmqpUrl],
      queue: StalkingCompletedEvent.name,
      queueOptions: { durable: false },
    },
  };

  const chatInterviewCompletedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [cloudAmqpUrl],
      queue: ChatInterviewCompletedEvent.name,
      queueOptions: { durable: false },
    },
  };

  app.connectMicroservice(stalkingCompletedMicroserviceOptions);
  app.connectMicroservice(chatInterviewCompletedMicroserviceOptions);

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
