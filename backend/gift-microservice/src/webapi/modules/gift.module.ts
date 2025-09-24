// src/webapi/modules/order.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GiftController } from '../controllers/gift.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { GiftReadyEvent } from 'src/domain/events/gift-ready.event';
import { GiftGenerateRequestedHandler } from 'src/app/handlers/gift-generate-requested.handler';
import { FetchOlxHandler } from 'src/app/handlers/fetch-olx.handler';
import { FetchEbayHandler } from 'src/app/handlers/fetch-ebay.handler';
import { FetchAmazonHandler } from 'src/app/handlers/fetch-amazon.handler';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'GIFT_READY_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: GiftReadyEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [GiftController, GiftGenerateRequestedHandler],
  providers: [FetchOlxHandler, FetchEbayHandler, FetchAmazonHandler],
})
export class GiftModule {}
