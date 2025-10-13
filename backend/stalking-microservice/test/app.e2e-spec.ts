import {
  StalkingAnalyzeRequestedEvent,
  StalkingCompletedEvent,
} from "@core/events";
import { RabbitMQContainer } from "@testcontainers/rabbitmq";
import type { StartedRabbitMQContainer } from "@testcontainers/rabbitmq";
import type { App } from "supertest/types";

import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppModule } from "./../src/app.module";
import { StalkingAnalyzeRequestHandler } from "./../src/app/handlers/stalking-analyze-request.handler";

jest.mock("@ai-sdk/openai", () => ({
  openai: jest.fn(() => ({})),
}));

jest.mock("ai", () => ({
  generateObject: jest.fn().mockResolvedValue({
    object: {
      facts: [
        "Loves hiking and photography",
        "Has 1000 followers",
        "Posts about nature and outdoor activities",
      ],
    },
  }),
}));

describe("Stalking Microservice (e2e)", () => {
  let app: INestApplication<App>;
  let rabbitMQContainer: StartedRabbitMQContainer;
  let emittedEvents: {
    pattern: string;
    data: StalkingCompletedEvent;
  }[] = [];

  beforeAll(async () => {
    rabbitMQContainer = await new RabbitMQContainer(
      "rabbitmq:3.12.11-alpine",
    ).start();
  });

  afterAll(async () => {
    await rabbitMQContainer.stop();
  });

  beforeEach(async () => {
    emittedEvents = [];

    // Set the RabbitMQ URL from the testcontainer
    process.env.CLOUDAMQP_URL = rabbitMQContainer.getAmqpUrl();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider("STALKING_COMPLETED_EVENT")
      .useValue({
        emit: jest.fn((pattern: string, data: StalkingCompletedEvent) => {
          emittedEvents.push({ pattern, data });
        }),
        connect: jest.fn().mockResolvedValue(null),
        close: jest.fn().mockResolvedValue(null),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.startAllMicroservices();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("StalkingAnalyzeRequestedEvent Handler", () => {
    it("should process event with Instagram URL and emit StalkingCompletedEvent", async () => {
      const chatId = "test-chat-123";
      const instagramUrl = "https://instagram.com/testuser";

      const event = new StalkingAnalyzeRequestedEvent(
        "", // facebookUrl
        instagramUrl, // instagramUrl
        "", // tiktokUrl
        "", // youtubeUrl
        "", // xUrl
        "", // linkedinUrl
        chatId, // chatId
      );

      const handler = app.get(StalkingAnalyzeRequestHandler);
      await handler.handle(event).catch(() => {
        // Handle AI extraction errors gracefully in tests
      });

      // Verify the event was emitted
      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0]?.pattern).toBe(StalkingCompletedEvent.name);
      expect(emittedEvents[0]?.data).toMatchObject({
        chatId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        completedAt: expect.any(Date),
      });
      expect(emittedEvents[0]?.data.keywords).toBeInstanceOf(Array);
    });
  });
});
