import { FetchOlxHandler } from "src/app/handlers/fetch-olx.handler";

import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { OlxController } from "../controllers/olx.controller";

@Module({
  imports: [CqrsModule],
  controllers: [OlxController],
  providers: [FetchOlxHandler],
})
export class OlxModule {}
