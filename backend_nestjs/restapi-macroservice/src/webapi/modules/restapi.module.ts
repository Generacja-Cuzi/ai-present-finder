// src/webapi/modules/order.module.ts
import { Module, Res } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RestApiController } from '../controllers/restapi.controller';
import { AnalyzeRequestHandler } from 'src/app/handlers/analyze-request.handler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnalyzeRequestedEvent } from 'src/domain/events/analyze-request.event';
import { ConfigModule } from '@nestjs/config';
import { ChatAskQuestionEvent } from 'src/domain/events/chat-ask-question.event';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'ANALYZE_REQUESTED_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: AnalyzeRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'ASK_QUESTION_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: ChatAskQuestionEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [RestApiController],
  providers: [AnalyzeRequestHandler],
})
export class RestApiModule {}
