// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { ChatAskQuestionEvent } from './domain/events/chat-ask-question.event';
import { ChatUserAnsweredEvent } from './domain/events/chat-user-answered.event';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const logger = new Logger('AppLogger');

  const chatAskQuestionMicroserviceOptions = {
    transport: Transport.RMQ,
      options: {
        urls: [process.env.CLOUDAMQP_URL || ''],
        queue: ChatAskQuestionEvent.name,
        queueOptions: {
          durable: false,
        },
      },
  };

  const chatUserAnsweredMicroserviceOptions = {
    transport: Transport.RMQ,
      options: {
        urls: [process.env.CLOUDAMQP_URL || ''],
        queue: ChatUserAnsweredEvent.name,
        queueOptions: {
          durable: false,
        },
      },
  };

  app.connectMicroservice(chatAskQuestionMicroserviceOptions);
  app.connectMicroservice(chatUserAnsweredMicroserviceOptions);

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);

  logger.log('Microservice is listening');
  logger.log('App is running on: http://localhost:3020');
  logger.log('Microservice is running on: amqp://localhost:5672');
}
bootstrap();
