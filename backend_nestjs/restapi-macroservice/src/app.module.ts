import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RestApiModule } from './webapi/modules/restapi.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RestApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
