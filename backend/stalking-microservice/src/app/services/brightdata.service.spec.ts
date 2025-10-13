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

    // Create a config service that doesn't use mock data
    const realConfigService = {
      get: (key: string) => {
        const config: Record<string, string> = {
          BRIGHTDATA_API_KEY: "test-api-key",
          BRIGHTDATA_ENDPOINT: "https://api.brightdata.com/datasets/v3/scrape",
          // No USE_MOCK_DATA, so it defaults to false
        };
        return config[key];
      },
    };

    // Use real API config for this test to test actual fetch behavior
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrightDataService,
        {
          provide: ConfigService,
          useValue: realConfigService,
        },
      ],
    }).compile();

    const realService = module.get<BrightDataService>(BrightDataService);

    // Mock fetch
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => JSON.stringify(payload),
    } as unknown as Response);

    const results = await realService.scrapeProfiles([
      { url: "https://instagram.com/example" },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0]?.url).toBe("https://instagram.com/example");
    expect(results[0]?.raw).toEqual(payload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_l1vikfch901nx3by4",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        }) as never,
        body: JSON.stringify({
          input: [{ url: "https://instagram.com/example" }],
        }),
      }),
    );
  });

  it("returns empty array when profile is not supported", async () => {
    const results = await service.scrapeProfiles([
      { url: "https://unsupported.com/profile" },
    ]);

    expect(results).toEqual([]);
  });

  it("uses correct dataset ID for each social platform", () => {
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
      // Test that the correct dataset ID is resolved
      expect(service.resolveDatasetId({ url })).toBe(expectedDatasetId);
    }
  });

  it("allows explicit dataset ID override", () => {
    const customDatasetId = "gd_custom123456";

    // Test that explicit dataset ID is used
    expect(
      service.resolveDatasetId({
        url: "https://facebook.com/test",
        datasetId: customDatasetId,
      }),
    ).toBe(customDatasetId);
  });

  it("handles multiple profiles in a single request", async () => {
    const results = await service.scrapeProfiles([
      { url: "https://instagram.com/user1" },
      { url: "https://instagram.com/user2" },
      { url: "https://unsupported.com/user3" },
    ]);

    expect(results).toHaveLength(2); // Only Instagram profiles are supported with mock data
  });

  it("continues processing other profiles if one fails", async () => {
    const results = await service.scrapeProfiles([
      { url: "https://instagram.com/user1" },
      { url: "https://unsupported.com/user2" },
      { url: "https://instagram.com/user3" },
    ]);

    expect(results).toHaveLength(2);
  });

  it("loads mock data for Instagram profiles", async () => {
    const results = await service.scrapeProfiles([
      { url: "https://instagram.com/example" },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0]?.url).toBe("https://instagram.com/example");
    expect(results[0]?.type).toBe("instagram");
    expect(Array.isArray(results[0]?.raw)).toBe(true);
  });
});
