// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { StalkingCompletedEvent } from './domain/events/stalking-completed.event';
import { ChatQuestionAskedEvent } from './domain/events/chat-question-asked.event';
import { ChatAnswerProcessedEvent } from './domain/events/chat-answer-processed.event';
import { GiftReadyEvent } from './domain/events/gift-ready.event';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('AppLogger');

  const stalkingCompletedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL || 'amqp://localhost:5672'],
      queue: StalkingCompletedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const chatQuestionAskedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL || 'amqp://localhost:5672'],
      queue: ChatQuestionAskedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const chatAnswerProcessedMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL || 'amqp://localhost:5672'],
      queue: ChatAnswerProcessedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  const giftReadyMicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL || 'amqp://localhost:5672'],
      queue: GiftReadyEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  app.connectMicroservice(stalkingCompletedMicroserviceOptions);
  app.connectMicroservice(chatQuestionAskedMicroserviceOptions);
  app.connectMicroservice(chatAnswerProcessedMicroserviceOptions);
  app.connectMicroservice(giftReadyMicroserviceOptions);

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);

  logger.log('Microservice is listening');
  logger.log('App is running on: http://localhost:3020');
  logger.log('Microservice is running on: amqp://localhost:5672');
}

void bootstrap();
