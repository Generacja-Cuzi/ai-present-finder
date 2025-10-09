import { ConfigModule, ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { FetchEbayHandler } from "../app/handlers/fetch-ebay.handler";
import { FetchEbayEvent } from "../domain/events/fetch-ebay.event";

interface MockEventBus {
  emit: jest.Mock;
}

describe("FetchEbayHandler (with .env, OLX-like structure)", () => {
  let handler: FetchEbayHandler;
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
        FetchEbayHandler,
        ConfigService,
        { provide: "PRODUCT_FETCHED_EVENT", useValue: mockEventBus },
      ],
    }).compile();

    handler = module.get<FetchEbayHandler>(FetchEbayHandler);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should load env variables", () => {
    const clientId = configService.get<string>("EBAY_CLIENT_ID") ?? "";
    const secret = configService.get<string>("EBAY_CLIENT_SECRET") ?? "";
    const tokenUrl = configService.get<string>("EBAY_TOKEN_URL") ?? "";
    const searchUrl = configService.get<string>("EBAY_SEARCH_URL") ?? "";
    const scope = configService.get<string>("EBAY_OAUTH_SCOPE") ?? "";
    const marketplace = configService.get<string>("EBAY_MARKETPLACE_ID") ?? "";

    expect(clientId).toBeDefined();
    expect(secret).toBeDefined();
    expect(tokenUrl).toBeDefined();
    expect(searchUrl).toBeDefined();
    expect(scope).toBeDefined();
    expect(marketplace).toBeDefined();

    // eslint-disable-next-line no-console
    console.log("Loaded from env:", {
      clientId,
      secret,
      tokenUrl,
      searchUrl,
      scope,
      marketplace,
    });
  });

  it("should handle FetchEbayEvent and print API response", async () => {
    const event = new FetchEbayEvent(
      "laptop",
      5,
      0,
      "test-request-id",
      "test-chat-id",
      "test-event-uuid",
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
        requestId: "test-request-id",
        chatId: "test-chat-id",
        provider: "ebay",
      }),
    );
  }, 30_000);
});
