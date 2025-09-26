// src/main.ts
<<<<<<< HEAD
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";

import { AppModule } from "./app.module";
import { ChatInappropriateRequestEvent } from "./domain/events/chat-innapropriate-request.event";
import { ChatInterviewCompletedEvent } from "./domain/events/chat-interview-completed.event";
import { ChatQuestionAskedEvent } from "./domain/events/chat-question-asked.event";
import { GiftReadyEvent } from "./domain/events/gift-ready.event";
import { StalkingCompletedEvent } from "./domain/events/stalking-completed.event";
=======
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { StalkingCompletedEvent } from './domain/events/stalking-completed.event';
import { ChatQuestionAskedEvent } from './domain/events/chat-question-asked.event';
import { ChatInterviewCompletedEvent } from './domain/events/chat-interview-completed.event';
import { GiftReadyEvent } from './domain/events/gift-ready.event';
import { ChatInappropriateRequestEvent } from './domain/events/chat-innapropriate-request.event';
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
<<<<<<< HEAD
    origin: ["http://localhost:5713", "http://localhost:5173"], // Vite dev server ports
=======
    origin: ['http://localhost:5713', 'http://localhost:5173'], 
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  });

<<<<<<< HEAD
  const logger = new Logger("AppLogger");
=======

  const config = new DocumentBuilder()
    .setTitle('AI Present Finder - REST API')
    .setDescription(
      'REST API for interacting with microservices: stalking requests, sending chat messages and streaming events via SSE.',
    )
    .setVersion('1.0')
    .addServer(
      process.env.SWAGGER_SERVER ||
        `http://localhost:${process.env.PORT ?? 3000}`,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outDir = 'docs/openapi';
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(
    `${outDir}/restapi-macroservice.openapi.json`,
    JSON.stringify(document, null, 2),
  );
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'AI Present Finder — REST API Docs',
  });

  const logger = new Logger('AppLogger');
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)

  const stalkingCompletedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: StalkingCompletedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const chatQuestionAskedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: ChatQuestionAskedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const chatAnswerProcessedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: ChatInterviewCompletedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const giftReadyMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: GiftReadyEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const chatInappropriateRequestMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672"],
      queue: ChatInappropriateRequestEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  app.connectMicroservice(stalkingCompletedMicroserviceOptions);
  app.connectMicroservice(chatQuestionAskedMicroserviceOptions);
  app.connectMicroservice(chatAnswerProcessedMicroserviceOptions);
  app.connectMicroservice(giftReadyMicroserviceOptions);
  app.connectMicroservice(chatInappropriateRequestMicroserviceOptions);

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);

  logger.log("Microservice is listening");
}

void bootstrap();
