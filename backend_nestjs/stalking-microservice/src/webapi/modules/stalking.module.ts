// src/webapi/modules/order.module.ts
import { Module, Res } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StalkingController } from '../controllers/stalking.controller';
import { AnalyzeRequestHandler } from 'src/app/handlers/analyze-request.handler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnalyzeRequestedEvent } from 'src/domain/events/analyze-request.event';
import { ConfigModule } from '@nestjs/config';
import { StalkingCompletedEvent } from 'src/domain/events/stalking-completed.event';
import { StalkingAnalyzeRequestHandler } from 'src/app/handlers/stalking-analyze-requested.handler';

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
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: StalkingCompletedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [StalkingController, AnalyzeRequestHandler],
  providers: [StalkingAnalyzeRequestHandler],
})
export class StalkingModule {}
