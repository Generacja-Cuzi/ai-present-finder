// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { StalkingAnalyzeRequestedEvent } from './domain/events/stalking-analyze-request.event';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('AppLogger');

  const microserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL || 'amqp://admin:admin@localhost:5672'],
      queue: StalkingAnalyzeRequestedEvent.name,
      queueOptions: {
        durable: false,
      },
    },
  };

  app.connectMicroservice(microserviceOptions);

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3010);

  logger.log('Microservice is listening');
}
void bootstrap();
