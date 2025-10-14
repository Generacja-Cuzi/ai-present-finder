import { StalkingCompletedEvent } from "@core/events";
import { extractFacts } from "src/app/ai/flow";
import type {
  BrightDataService,
  ScrapeRequestItem,
} from "src/app/services/brightdata.service";
import { StalkingAnalyzeCommand } from "src/domain/commands/stalking-analyze.command";
import type { AnyProfileScrapeResult } from "src/domain/models/profile-scrape-result.model";
import type { InstagramProfileResponse } from "src/domain/types/instagram.types";
import type { XPostsResponse } from "src/domain/types/x-posts.types";

import type { ClientProxy } from "@nestjs/microservices";

import { StalkingAnalyzeHandler } from "./stalking-analyze.handler";

jest.mock("src/app/ai/flow", () => ({
  extractFacts: jest.fn(),
}));

type ScrapeProfilesMock = jest.MockedFunction<
  BrightDataService["scrapeProfiles"]
>;

function createHandler(scrapeProfilesImplementation: ScrapeProfilesMock) {
  const brightDataService = {
    scrapeProfiles: scrapeProfilesImplementation,
  } as unknown as BrightDataService;

  const emit = jest.fn();
  const eventBus = { emit } as unknown as ClientProxy;

  const handler = new StalkingAnalyzeHandler(brightDataService, eventBus);

  return { handler, emit };
}

describe("StalkingAnalyzeHandler", () => {
  beforeEach(() => {
    jest
      .mocked(extractFacts)
      .mockResolvedValue({ facts: ["hiking", "running"] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("scrapes provided URLs and emits completed event with keywords", async () => {
    const scrapeProfiles = jest
      .fn<Promise<AnyProfileScrapeResult[]>, [ScrapeRequestItem[]]>()
      .mockResolvedValue([
        {
          type: "instagram",
          url: "https://instagram.com/test",
          fetchedAt: new Date().toISOString(),
          raw: [] as InstagramProfileResponse,
        },
        {
          type: "x",
          url: "https://x.com/runner",
          fetchedAt: new Date().toISOString(),
          raw: [] as XPostsResponse,
        },
      ] as AnyProfileScrapeResult[]);

    const { handler, emit } = createHandler(
      scrapeProfiles as ScrapeProfilesMock,
    );

    const command = new StalkingAnalyzeCommand({
      facebookUrl: " https://facebook.com/test ",
      instagramUrl: "https://instagram.com/runner",
      chatId: "chat-123",
    });

    await handler.execute(command);

    expect(scrapeProfiles).toHaveBeenCalledWith([
      { url: "https://facebook.com/test" },
      { url: "https://instagram.com/runner" },
    ]);

    expect(emit).toHaveBeenCalledTimes(1);
    const [eventName, event] = emit.mock.calls[0] as [
      string,
      StalkingCompletedEvent,
    ];
    expect(eventName).toBe(StalkingCompletedEvent.name);
    expect(event).toBeInstanceOf(StalkingCompletedEvent);
    expect(event.chatId).toBe("chat-123");
    expect(event.keywords).toEqual(
      expect.arrayContaining(["hiking", "running"]),
    );
    expect(event.completedAt).toBeInstanceOf(Date);
  });

  it("emits empty results when no URLs are provided", async () => {
    const scrapeProfiles = jest
      .fn<Promise<AnyProfileScrapeResult[]>, [ScrapeRequestItem[]]>()
      .mockResolvedValue([]);
    const { handler, emit } = createHandler(
      scrapeProfiles as ScrapeProfilesMock,
    );

    const command = new StalkingAnalyzeCommand({
      chatId: "chat-789",
    });

    await handler.execute(command);

    expect(scrapeProfiles).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledTimes(1);
    const [, event] = emit.mock.calls[0] as [string, StalkingCompletedEvent];
    expect(event.keywords).toEqual([]);
  });
});
