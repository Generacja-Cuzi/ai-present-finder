import type { InstagramProfileResponse } from "./instagram.types";
import type { TikTokProfileResponse } from "./tiktok.types";
import type { XPostsResponse } from "./x-posts.types";

export interface ProfileScrapeResultBase {
  url: string;
  fetchedAt: string;
}

export interface InstagramProfileScrapeResult extends ProfileScrapeResultBase {
  type: "instagram";
  raw: InstagramProfileResponse; // InstagramProfileResponse
}

export interface XProfileScrapeResult extends ProfileScrapeResultBase {
  type: "x";
  raw: XPostsResponse; // XPostsResponse
}

export interface TikTokProfileScrapeResult extends ProfileScrapeResultBase {
  type: "tiktok";
  raw: TikTokProfileResponse; // TikTokProfileResponse
}

export type AnyProfileScrapeResult =
  | InstagramProfileScrapeResult
  | XProfileScrapeResult
  | TikTokProfileScrapeResult;
