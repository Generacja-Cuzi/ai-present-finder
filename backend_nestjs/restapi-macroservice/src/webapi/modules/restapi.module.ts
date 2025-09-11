// src/webapi/modules/order.module.ts
import { Module, Res } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RestApiController } from '../controllers/restapi.controller';
import { StalkingAnalyzeRequestHandler } from 'src/app/handlers/stalking-analyze-request.handler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { StalkingAnalyzeRequestedEvent } from 'src/domain/events/stalking-analyze-request.event';
import { ConfigModule } from '@nestjs/config';
import { ChatAskQuestionEvent } from 'src/domain/events/chat-ask-question.event';
import { ChatUserAnsweredEvent } from 'src/domain/events/chat-user-answered.event';
import { StalkingCompletedHandler } from 'src/app/handlers/stalking-completed.handler';
import { ChatQuestionAskedHandler } from 'src/app/handlers/chat-question-asked.handler';
import { ChatAnswerProcessedHandler } from 'src/app/handlers/chat-answer-processed.handler';
import { EvaluateContextHandler } from 'src/app/handlers/evaluate-context.handler';
import { GiftGenerateRequestedEvent } from 'src/domain/events/gift-generate-requested.event';
import { GiftReadyHandler } from 'src/app/handlers/gift-ready.handler';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'STALKING_ANALYZE_REQUESTED_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: StalkingAnalyzeRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'CHAT_ASK_QUESTION_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: ChatAskQuestionEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'CHAT_USER_ANSWERED_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: ChatUserAnsweredEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'GIFT_GENERATE_REQUESTED_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: GiftGenerateRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    RestApiController,
    StalkingCompletedHandler,
    ChatQuestionAskedHandler,
    ChatAnswerProcessedHandler,
    GiftReadyHandler,
  ],
  providers: [StalkingAnalyzeRequestHandler, EvaluateContextHandler],
})
export class RestApiModule {}
