import { ConfigModule, ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { FetchAmazonHandler } from "../app/handlers/fetch-amazon.handler";

interface MockEventBus {
  emit: jest.Mock;
}

describe("FetchAmazonHandler (with .env, OLX-like structure)", () => {
  let handler: FetchAmazonHandler;
  let mockEventBus: MockEventBus;
  let configService: ConfigService;

  beforeEach(async () => {
    mockEventBus = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ".env",
          isGlobal: true,
        }),
      ],
      providers: [
        FetchAmazonHandler,
        ConfigService,
        { provide: "PRODUCT_FETCHED_EVENT", useValue: mockEventBus },
      ],
    }).compile();

    handler = module.get<FetchAmazonHandler>(FetchAmazonHandler);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should load env variables", () => {
    const rapidKey = configService.get<string>("RAPIDAPI_KEY") ?? "";
    const apiUrl = configService.get<string>("AMAZON_API_URL") ?? "";
    const apiHost = configService.get<string>("AMAZON_API_HOST") ?? "";
    const country = configService.get<string>("AMAZON_COUNTRY") ?? "";
    const maxRetries =
      configService.get<string | number>("AMAZON_MAX_RETRIES") ?? "";

    expect(rapidKey).toBeDefined();
    expect(apiUrl).toBeDefined();
    expect(apiHost).toBeDefined();
    expect(country).toBeDefined();
    expect(maxRetries).toBeDefined();

    // eslint-disable-next-line no-console
    console.log("Loaded from env:", {
      apiUrl,
      apiHost,
      country,
      maxRetries,
      rapidKey,
    });
  });

  //   it("should handle FetchAmazonEvent and print API response", async () => {
  //     const event = new FetchAmazonEvent(
  //       "laptop",
  //       5,
  //       0,
  //       "PL",
  //       1,
  //       "test-request-id",
  //       "test-chat-id",
  //       "test-event-uuid",
  //     );

  //     await handler.handle(event);

  //     expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
  //     const emitCall = mockEventBus.emit.mock.calls[0] as unknown[];
  //     const emittedEvent = emitCall[1];

  //     // eslint-disable-next-line no-console
  //     console.log("API Response result:", JSON.stringify(emittedEvent, null, 2));

  //     expect(mockEventBus.emit).toHaveBeenCalledWith(
  //       "ProductFetchedEvent",
  //       expect.objectContaining({
  //         requestId: "test-request-id",
  //         chatId: "test-chat-id",
  //         provider: "amazon",
  //       }),
  //     );
  //   }, 30_000);
});
