// src/webapi/modules/order.module.ts
import { Module, Res } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ChatController} from '../controllers/chat.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { ChatQuestionAskedEvent } from 'src/domain/events/chat-question-asked.event';
import { ChatAskQuestionHandler } from 'src/app/handlers/chat-ask-question.handler';
import { ChatQuestionAskedHandler } from 'src/app/handlers/chat-question.asked.handler';
import { ChatAnswerProcessedEvent } from 'src/domain/events/chat-answer-processed.event';
import { ChatUserAnsweredHandler } from 'src/app/handlers/chat-user-answered.handler';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'CHAT_QUESTION_ASKED_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: ChatQuestionAskedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'CHAT_ANSWER_PROCESSED_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: ChatAnswerProcessedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      }
    ]),
  ],
  controllers: [ChatController, ChatAskQuestionHandler, ChatUserAnsweredHandler],
  providers: [ChatQuestionAskedHandler],
})
export class ChatModule {}
