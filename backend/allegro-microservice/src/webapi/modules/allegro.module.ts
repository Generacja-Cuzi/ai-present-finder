import { FetchAllegroHandler } from "src/app/handlers/fetch-allegro.handler";

import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { AllegroController } from "../controllers/allegro.controller";

@Module({
  imports: [CqrsModule],
  controllers: [AllegroController],
  providers: [FetchAllegroHandler],
})
export class AllegroModule {}
