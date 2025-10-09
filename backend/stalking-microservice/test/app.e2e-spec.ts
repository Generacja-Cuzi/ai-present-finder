import type { App } from "supertest/types";

import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppModule } from "./../src/app.module";
import { StalkingAnalyzeRequestHandler } from "./../src/app/handlers/stalking-analyze-request.handler";
import { BrightDataService } from "./../src/app/services/brightdata.service";
import { StalkingAnalyzeRequestedEvent } from "./../src/domain/events/stalking-analyze-request.event";
import { StalkingCompletedEvent } from "./../src/domain/events/stalking-completed.event";
import type {
  AnyProfileScrapeResult,
  ProfileScrapeResult,
} from "./../src/domain/models/profile-scrape-result.model";
import type { InstagramProfileResponse } from "./../src/domain/types/instagram.types";

describe("Stalking Microservice (e2e)", () => {
  let app: INestApplication<App>;
  let brightDataService: BrightDataService;
  let emittedEvents: {
    pattern: string;
    data: StalkingCompletedEvent;
  }[] = [];

  beforeEach(async () => {
    emittedEvents = [];

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BrightDataService)
      .useValue({
        scrapeProfiles: jest.fn(),
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

    brightDataService = moduleFixture.get(BrightDataService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe("StalkingAnalyzeRequestedEvent Handler", () => {
    it("should process event with Instagram URL and emit StalkingCompletedEvent", async () => {
      const chatId = "test-chat-123";
      const instagramUrl = "https://instagram.com/testuser";

      const mockInstagramData: InstagramProfileResponse = [
        {
          account: "testuser",
          fbid: "123456",
          id: "ig_123",
          followers: 1000,
          posts_count: 150,
          is_business_account: false,
          is_professional_account: false,
          is_verified: false,
          avg_engagement: 5.5,
          external_url: ["https://example.com"],
          biography: "Love hiking and photography",
          business_category_name: "",
          category_name: null,
          post_hashtags: ["#hiking", "#photography"],
          following: 500,
          posts: [],
          profile_image_link: "https://example.com/pic.jpg",
          profile_url: instagramUrl,
          profile_name: "testuser",
          highlights_count: 3,
          highlights: null,
          full_name: "Test User",
          is_private: false,
          bio_hashtags: null,
          url: instagramUrl,
          is_joined_recently: false,
          has_channel: false,
          partner_id: "",
          business_address: null,
          related_accounts: [],
          email_address: null,
        },
      ];

      const mockProfiles: AnyProfileScrapeResult[] = [
        {
          type: "instagram",
          url: instagramUrl,
          fetchedAt: new Date().toISOString(),
          raw: mockInstagramData,
        } as ProfileScrapeResult,
      ];

      const scrapeProfilesSpy = jest
        .spyOn(brightDataService, "scrapeProfiles")
        .mockResolvedValue(mockProfiles);

      const event = new StalkingAnalyzeRequestedEvent(
        chatId,
        undefined,
        instagramUrl,
      );

      const handler = app.get(StalkingAnalyzeRequestHandler);
      await handler.handle(event).catch(() => {
        // Handle AI extraction errors gracefully in tests
      });

      // Wait for async operations
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      // Assert
      // Verify BrightData service was called correctly
      expect(scrapeProfilesSpy).toHaveBeenCalledTimes(1);

      // Verify the event was emitted
      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0]?.pattern).toBe(StalkingCompletedEvent.name);
      expect(emittedEvents[0]?.data).toMatchObject({
        chatId,
        completedAt: expect.any(Date) as Date,
        profiles: mockProfiles,
      });
      expect(emittedEvents[0]?.data.keywords).toBeInstanceOf(Array);
    });
  });
});
