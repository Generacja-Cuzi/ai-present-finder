import * as nock from "nock";
import { MockConfigService } from "src/app/services/mock-config-service";

import { ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { BrightDataService, DATASET_MAP } from "./brightdata.service";

describe("BrightDataService", () => {
  let service: BrightDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrightDataService,
        {
          provide: ConfigService,
          useFactory: () => MockConfigService,
        },
      ],
    }).compile();

    service = module.get<BrightDataService>(BrightDataService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    nock.cleanAll();
  });

  describe("Dataset Configuration", () => {
    it("should use hardcoded dataset map", () => {
      expect(DATASET_MAP).toBeDefined();
      expect(Object.keys(DATASET_MAP).length).toBeGreaterThan(0);
    });

    it("should have primary social media sources configured", () => {
      expect(DATASET_MAP.facebook).toBe("gd_lkaxegm826bjpoo9m5");
      expect(DATASET_MAP.instagram).toBe("gd_l1vikfch901nx3by4");
      expect(DATASET_MAP.tiktok).toBe("gd_l1villgoiiidt09ci");
      expect(DATASET_MAP.youtube).toBe("gd_lk538t2k2p1k3oos71");
      expect(DATASET_MAP.linkedin).toBe("gd_l1viktl72bvl7bjuj0");
      expect(DATASET_MAP.x).toBe("gd_lwxmeb2u1cniijd7t4");
    });

    it("should not require BRIGHTDATA_DATASET_ID env variable", () => {
      // Service should initialize successfully without BRIGHTDATA_DATASET_ID
      expect(service).toBeDefined();
    });
  });

  it("sends scrape requests and parses JSON responses", async () => {
    const payload = { data: { posts: [{ id: "1", content: "Hello hiking" }] } };

    const scope = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: "gd_lkaxegm826bjpoo9m5" })
      .matchHeader("authorization", "Bearer test-api-key")
      .matchHeader("content-type", "application/json")
      .reply(200, payload);

    const results = await service.scrapeProfiles([
      { url: "https://facebook.com/example" },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0]?.url).toBe("https://facebook.com/example");
    expect(results[0]?.raw).toEqual(payload);
    scope.done();
  });

  it("skips results when Bright Data returns 202", async () => {
    const scope = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: "gd_l1vikfch901nx3by4" })
      .reply(202, { message: "Processing" });

    const results = await service.scrapeProfiles([
      { url: "https://instagram.com/sample" },
    ]);

    expect(results).toEqual([]);
    scope.done();
  });

  it("returns empty array when Bright Data request fails", async () => {
    const scope = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: "gd_l1villgoiiidt09ci" })
      .reply(500, "Internal error");

    const results = await service.scrapeProfiles([
      { url: "https://tiktok.com/profile" },
    ]);

    expect(results).toEqual([]);
    scope.done();
  });

  it("uses correct dataset ID for each social platform", async () => {
    const testCases = [
      {
        url: "https://facebook.com/test",
        expectedDatasetId: DATASET_MAP.facebook,
      },
      {
        url: "https://instagram.com/test",
        expectedDatasetId: DATASET_MAP.instagram,
      },
      {
        url: "https://tiktok.com/@test",
        expectedDatasetId: DATASET_MAP.tiktok,
      },
      {
        url: "https://youtube.com/@test",
        expectedDatasetId: DATASET_MAP.youtube,
      },
      {
        url: "https://linkedin.com/in/test",
        expectedDatasetId: DATASET_MAP.linkedin,
      },
      { url: "https://x.com/test", expectedDatasetId: DATASET_MAP.x },
    ];

    for (const { url, expectedDatasetId } of testCases) {
      const scope = nock("https://api.brightdata.com")
        .post("/datasets/v3/scrape")
        .query({ dataset_id: expectedDatasetId })
        .reply(200, { data: "test" });

      await service.scrapeProfiles([{ url }]);

      scope.done();
    }
  });

  it("allows explicit dataset ID override", async () => {
    const customDatasetId = "gd_custom123456";

    const scope = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: customDatasetId })
      .reply(200, { data: "test" });

    await service.scrapeProfiles([
      { url: "https://facebook.com/test", datasetId: customDatasetId },
    ]);

    scope.done();
  });

  it("handles multiple profiles in a single request", async () => {
    const scope1 = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: DATASET_MAP.facebook })
      .reply(200, { data: "test" });

    const scope2 = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: DATASET_MAP.instagram })
      .reply(200, { data: "test" });

    const scope3 = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: DATASET_MAP.tiktok })
      .reply(200, { data: "test" });

    const results = await service.scrapeProfiles([
      { url: "https://facebook.com/user1" },
      { url: "https://instagram.com/user2" },
      { url: "https://tiktok.com/@user3" },
    ]);

    expect(results).toHaveLength(3);

    scope1.done();
    scope2.done();
    scope3.done();
  });

  it("continues processing other profiles if one fails", async () => {
    const scope1 = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: DATASET_MAP.facebook })
      .reply(200, { data: "success" });

    const scope2 = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: DATASET_MAP.instagram })
      .reply(500, "Error");

    const scope3 = nock("https://api.brightdata.com")
      .post("/datasets/v3/scrape")
      .query({ dataset_id: DATASET_MAP.tiktok })
      .reply(200, { data: "success" });

    const results = await service.scrapeProfiles([
      { url: "https://facebook.com/user1" },
      { url: "https://instagram.com/user2" },
      { url: "https://tiktok.com/@user3" },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0]?.url).toBe("https://facebook.com/user1");
    expect(results[1]?.url).toBe("https://tiktok.com/@user3");

    scope1.done();
    scope2.done();
    scope3.done();
  });
});
