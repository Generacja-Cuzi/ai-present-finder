import type {
  BrightDataService,
  ScrapeRequestItem,
} from "src/app/services/brightdata.service";
import { StalkingAnalyzeCommand } from "src/domain/commands/stalking-analyze.command";
import { StalkingCompletedEvent } from "src/domain/events/stalking-completed.event";
import type { ProfileScrapeResult } from "src/domain/models/profile-scrape-result.model";

import type { ClientProxy } from "@nestjs/microservices";

import { StalkingAnalyzeHandler } from "./stalking-analyze.handler";

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
  it("scrapes provided URLs and emits completed event with keywords", async () => {
    const scrapeProfiles = jest
      .fn<Promise<ProfileScrapeResult[]>, [ScrapeRequestItem[]]>()
      .mockResolvedValue([
        {
          url: "https://facebook.com/test",
          fetchedAt: new Date().toISOString(),
          raw: { content: "Loves hiking boots and outdoor adventures" },
        },
        {
          url: "https://instagram.com/runner",
          fetchedAt: new Date().toISOString(),
          raw: "Running shoes for marathon training",
        },
      ]);

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
    expect(event.profiles).toHaveLength(2);
    expect(event.keywords).toEqual(
      expect.arrayContaining(["hiking", "running"]),
    );
    expect(event.completedAt).toBeInstanceOf(Date);
  });

  it("emits empty results when no URLs are provided", async () => {
    const scrapeProfiles = jest
      .fn<Promise<ProfileScrapeResult[]>, [ScrapeRequestItem[]]>()
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
    expect(event.profiles).toEqual([]);
    expect(event.keywords).toEqual([]);
  });
});
