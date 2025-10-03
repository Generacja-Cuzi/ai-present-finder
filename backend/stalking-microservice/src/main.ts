// src/main.ts
import { existsSync, mkdirSync, writeFileSync } from "fs";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { StalkingAnalyzeRequestedEvent } from "./domain/events/stalking-analyze-request.event";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger("AppLogger");

  const microserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: StalkingAnalyzeRequestedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const config = new DocumentBuilder()
    .setTitle("AI Present Finder - Stalking Microservice")
    .setDescription(
      "Endpoints for requesting stalking/analyze jobs and retrieving status.",
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
    `${outDir}/stalking-microservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "AI Present Finder — Stalking Docs",
  });

  app.connectMicroservice(microserviceOptions);

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3010);

  logger.log("Microservice is listening");
}
void bootstrap();
