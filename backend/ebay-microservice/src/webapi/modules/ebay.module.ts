import { FetchEbayHandler } from "src/app/handlers/fetch-ebay.handler";

import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { EbayController } from "../controllers/ebay.controller";

@Module({
  imports: [CqrsModule],
  controllers: [EbayController],
  providers: [FetchEbayHandler],
})
export class EbayModule {}
