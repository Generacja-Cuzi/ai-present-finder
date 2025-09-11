import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatController } from './chat/chat.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.local.env',
      isGlobal: true,
    }),
  ],
  controllers: [AppController, ChatController],
  providers: [AppService],
})
export class AppModule {}
