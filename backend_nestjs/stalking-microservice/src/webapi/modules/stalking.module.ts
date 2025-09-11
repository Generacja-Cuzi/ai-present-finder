// src/webapi/modules/order.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StalkingController } from '../controllers/stalking.controller';
import { StalkingAnalyzeRequestHandler } from 'src/app/handlers/stalking-analyze-request.handler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { StalkingCompletedEvent } from 'src/domain/events/stalking-completed.event';
import { StalkingAnalyzeHandler } from 'src/app/handlers/stalking-analyze.handler';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'STALKING_COMPLETED_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || 'amqp://localhost:5672'],
          queue: StalkingCompletedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [StalkingController, StalkingAnalyzeRequestHandler],
  providers: [StalkingAnalyzeHandler],
})
export class StalkingModule {}
