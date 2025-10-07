import type { ConfigService } from "@nestjs/config";

type FetchCall = [string, RequestInit | undefined];

const createConfigService = (
  overrides: Partial<Record<string, string>> = {},
): ConfigService => {
  const defaults: Record<string, string> = {
    BRIGHTDATA_API_KEY: "test-api-key",
    BRIGHTDATA_DATASET_ID: "test-dataset",
    BRIGHTDATA_ENDPOINT: "https://api.brightdata.com/datasets/v3/scrape",
    BRIGHTDATA_CUSTOM_OUTPUT_FIELDS: "url|about.updated_on",
  };

  const values = { ...defaults, ...overrides };

  return {
    get: <T = string>(key: string, defaultValue?: T) => {
      const value = values[key];
      return (value ?? defaultValue) as T;
    },
  } as unknown as ConfigService;
};

describe("BrightDataService", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    jest.resetAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("sends scrape requests and parses JSON responses", async () => {
    const { BrightDataService } = await import("./brightdata.service");
    const configService = createConfigService();
    const service = new BrightDataService(configService);

    const payload = { data: { posts: [{ id: "1", content: "Hello hiking" }] } };
    const textPayload = JSON.stringify(payload);

    const fetchMock = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: jest.fn().mockResolvedValue(textPayload),
    } as unknown as Response);

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const results = await service.scrapeProfiles([
      { url: "https://facebook.com/example" },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as FetchCall;
    expect(requestUrl).toBe(
      "https://api.brightdata.com/datasets/v3/scrape?dataset_id=test-dataset",
    );
    expect(requestInit?.method).toBe("POST");
    expect(requestInit?.headers).toMatchObject({
      Authorization: "Bearer test-api-key",
      "Content-Type": "application/json",
    });

    const requestBody = (requestInit?.body as string | undefined) ?? "{}";
    const parsedBody = JSON.parse(requestBody) as {
      input: Record<string, unknown>[];
      custom_output_fields: string;
    };
    expect(parsedBody.input).toHaveLength(1);
    expect(parsedBody.input[0].url).toBe("https://facebook.com/example");
    expect(parsedBody.custom_output_fields).toBe("url|about.updated_on");

    expect(results).toHaveLength(1);
    expect(results[0].url).toBe("https://facebook.com/example");
    expect(results[0].raw).toEqual(payload);
  });

  it("skips results when Bright Data returns 202", async () => {
    const { BrightDataService } = await import("./brightdata.service");
    const configService = createConfigService();
    const service = new BrightDataService(configService);

    const fetchMock = jest.fn().mockResolvedValue({
      status: 202,
      ok: true,
      json: jest.fn().mockResolvedValue({ message: "Processing" }),
      text: jest.fn(),
    } as unknown as Response);

    const warnSpy = jest.spyOn(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (service as any).logger,
      "warn",
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const results = await service.scrapeProfiles([
      { url: "https://instagram.com/sample" },
    ]);

    expect(results).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith("Processing");
  });

  it("logs errors when Bright Data request fails", async () => {
    const { BrightDataService } = await import("./brightdata.service");
    const configService = createConfigService();
    const service = new BrightDataService(configService);

    const fetchMock = jest.fn().mockResolvedValue({
      status: 500,
      ok: false,
      text: jest.fn().mockResolvedValue("Internal error"),
    } as unknown as Response);

    const errorSpy = jest.spyOn(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (service as any).logger,
      "error",
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const results = await service.scrapeProfiles([
      { url: "https://tiktok.com/profile" },
    ]);

    expect(results).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });
});
