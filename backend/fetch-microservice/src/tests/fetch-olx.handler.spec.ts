import { FetchOlxEvent } from "@core/events";

import { ConfigModule, ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { FetchOlxHandler } from "../app/handlers/fetch-olx.handler";

interface MockEventBus {
  emit: jest.Mock;
}

describe("FetchOlxHandler (with .env)", () => {
  let handler: FetchOlxHandler;
  let mockEventBus: MockEventBus;
  let configService: ConfigService;

  beforeEach(async () => {
    mockEventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ".env",
          isGlobal: true,
        }),
      ],
      providers: [
        FetchOlxHandler,
        ConfigService,
        { provide: "PRODUCT_FETCHED_EVENT", useValue: mockEventBus },
      ],
    }).compile();

    handler = module.get<FetchOlxHandler>(FetchOlxHandler);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should load env variables", () => {
    const apiUrl = configService.get<string>("OLX_API_URL") ?? "";
    const retries = configService.get<number>("OLX_MAX_RETRIES") ?? 0;

    expect(apiUrl).toBeDefined();
    expect(retries).toBeDefined();

    // eslint-disable-next-line no-console
    console.log("Loaded from env:", { apiUrl, retries });
  });

  it("should handle FetchOlxEvent and emit ProductFetchedEvent", async () => {
    const event = new FetchOlxEvent(
      "telefon",
      2,
      0,
      "test-chat-id",
      "test-event-uuid",
      10,
    );

    await handler.handle(event);

    expect(mockEventBus.emit).toHaveBeenCalledTimes(1);

    const emitCall = mockEventBus.emit.mock.calls[0] as unknown[];
    const emittedEvent = emitCall[1];

    // eslint-disable-next-line no-console
    console.log("API Response result:", JSON.stringify(emittedEvent, null, 2));

    expect(mockEventBus.emit).toHaveBeenCalledWith(
      "ProductFetchedEvent",
      expect.objectContaining({
        chatId: "test-chat-id",
        provider: "olx",
      }),
    );
  }, 10_000);
});
