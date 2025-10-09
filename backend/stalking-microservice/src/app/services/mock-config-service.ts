export const MockConfigService = {
  get: (key: string, defaultValue?: string) => {
    const config: Record<string, string> = {
      BRIGHTDATA_API_KEY: "test-api-key",
      BRIGHTDATA_ENDPOINT: "https://api.brightdata.com/datasets/v3/scrape",
    };
    return config[key] ?? defaultValue;
  },
};
