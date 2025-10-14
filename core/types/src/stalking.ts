export interface ProfileScrapeResultBase {
  url: string;
  fetchedAt: string;
}

export interface InstagramProfileScrapeResult extends ProfileScrapeResultBase {
  type: "instagram";
  raw: unknown[]; // InstagramProfileResponse
}

export interface XProfileScrapeResult extends ProfileScrapeResultBase {
  type: "x";
  raw: unknown[]; // XPostsResponse
}

export interface TikTokProfileScrapeResult extends ProfileScrapeResultBase {
  type: "tiktok";
  raw: unknown[]; // TikTokProfileResponse
}

export type AnyProfileScrapeResult =
  | InstagramProfileScrapeResult
  | XProfileScrapeResult
  | TikTokProfileScrapeResult;
