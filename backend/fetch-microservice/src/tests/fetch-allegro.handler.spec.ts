import { ConfigModule, ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { FetchAllegroHandler } from "../app/handlers/fetch-allegro.handler";
import { FetchAllegroEvent } from "../domain/events/fetch-allegro.event";

interface MockEventBus {
  emit: jest.Mock;
}

describe("FetchAllegroHandler (with .env)", () => {
  let handler: FetchAllegroHandler;
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
        FetchAllegroHandler,
        ConfigService,
        { provide: "PRODUCT_FETCHED_EVENT", useValue: mockEventBus },
      ],
    }).compile();

    handler = module.get<FetchAllegroHandler>(FetchAllegroHandler);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should load env variables", () => {
    const clientId = configService.get<string>("ALLEGRO_CLIENT_ID");
    const clientSecret = configService.get<string>("ALLEGRO_CLIENT_SECRET");
    const tokenUrl = configService.get<string>("ALLEGRO_TOKEN_URL");
    const searchUrl = configService.get<string>("ALLEGRO_SEARCH_URL");
    const baseOfferUrl = configService.get<string>("ALLEGRO_BASE_OFFER_URL");
    const maxRetries = configService.get<string | number>(
      "ALLEGRO_MAX_RETRIES",
    );

    expect(clientId).toBeDefined();
    expect(clientSecret).toBeDefined();
    expect(tokenUrl).toBeDefined();
    expect(searchUrl).toBeDefined();
    expect(baseOfferUrl).toBeDefined();
    expect(maxRetries).toBeDefined();

    // eslint-disable-next-line no-console
    console.log("Loaded from env:", {
      clientIdPresent: Boolean(clientId),
      clientSecretPresent: Boolean(clientSecret),
      tokenUrl,
      searchUrl,
      baseOfferUrl,
      maxRetries,
    });
  });

  it("should handle FetchAllegroEvent and print API response", async () => {
    const event = new FetchAllegroEvent(
      "laptop",
      5,
      0,
      "test-request-id",
      "test-chat-id",
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
        provider: "allegro",
      }),
    );
  }, 30_000);
});
