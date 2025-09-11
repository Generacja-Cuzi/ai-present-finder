import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { StalkingModule } from './webapi/modules/gift.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StalkingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
