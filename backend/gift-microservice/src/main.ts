// src/main.ts
<<<<<<< HEAD
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";

import { AppModule } from "./app.module";
import { GiftGenerateRequestedEvent } from "./domain/events/gift-generate-requested.event";
=======
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { GiftGenerateRequestedEvent } from './domain/events/gift-generate-requested.event';
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger("AppLogger");

  const microserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: GiftGenerateRequestedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  app.connectMicroservice(microserviceOptions);
  
  const config = new DocumentBuilder()
    .setTitle('AI Present Finder - Gift Microservice')
    .setDescription(
      'Endpoints for searching gift listings across sources (OLX, eBay, Amazon).',
    )
    .setVersion('1.0')
    .addServer(
      process.env.SWAGGER_SERVER ||
        `http://localhost:${process.env.PORT ?? 3030}`,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outDir = 'docs/openapi';
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(
    `${outDir}/gift-microservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'AI Present Finder — Gift Docs',
  });
  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3030);

  logger.log("Microservice is listening");
}
void bootstrap();
