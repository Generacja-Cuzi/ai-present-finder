import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";

import { AppModule } from "./app.module";
import { FetchAllegroEvent } from "./domain/events/fetch-allegro.event";
import { FetchAmazonEvent } from "./domain/events/fetch-amazon.event";
import { FetchEbayEvent } from "./domain/events/fetch-ebay.event";
import { FetchOlxEvent } from "./domain/events/fetch-olx.event";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("FetchMicroservice");

  const cloudAmqpUrl =
    process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672";

  const provider = process.env.FETCH_PROVIDER ?? "allegro";

  logger.log(`${provider}`);

  const queueName =
    provider === "allegro"
      ? FetchAllegroEvent.name
      : provider === "amazon"
        ? FetchAmazonEvent.name
        : provider === "ebay"
          ? FetchEbayEvent.name
          : provider === "olx"
            ? FetchOlxEvent.name
            : (() => {
                throw new Error(`Unsupported provider: ${provider}`);
              })();

  logger.log(`Starting fetch microservice for provider: ${provider}`);
  logger.log(`Listening on queue: ${queueName}`);

  const microserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [cloudAmqpUrl],
      queue: queueName,
      queueOptions: { durable: false },
    },
  };

  app.connectMicroservice(microserviceOptions);

  await app.startAllMicroservices();

  logger.log(`Fetch microservice for ${provider} is running`);
}

void bootstrap();
