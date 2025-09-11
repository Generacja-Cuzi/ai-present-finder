// src/webapi/modules/order.module.ts
import { Module, Res } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GiftController } from '../controllers/gift.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { GiftReadyEvent } from 'src/domain/events/gift-ready.event';
import { GiftGenerateRequestedHandler } from 'src/app/handlers/gift-generate-requested.handler';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'GIFT_READY_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL || ''],
          queue: GiftReadyEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [GiftController, GiftGenerateRequestedHandler],
  providers: [],
})
export class StalkingModule {}
