// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { StalkingCompletedEvent } from './domain/events/stalking-completed.event';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const logger = new Logger('AppLogger');
  
  const microserviceOptions = {
    transport: Transport.RMQ,
      options: {
        urls: [process.env.CLOUDAMQP_URL || ''],
        queue: StalkingCompletedEvent.name,
        queueOptions: {
          durable: false,
        },
      },
  };
  
  app.connectMicroservice(microserviceOptions);

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);

  logger.log('Microservice is listening');
  logger.log('App is running on: http://localhost:3020');
  logger.log('Microservice is running on: amqp://localhost:5672');
}
bootstrap();
