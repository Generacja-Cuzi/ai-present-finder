import { FetchAmazonHandler } from "src/app/handlers/fetch-amazon.handler";

import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { AmazonController } from "../controllers/amazon.controller";

@Module({
  imports: [CqrsModule],
  controllers: [AmazonController],
  providers: [FetchAmazonHandler],
})
export class AmazonModule {}
