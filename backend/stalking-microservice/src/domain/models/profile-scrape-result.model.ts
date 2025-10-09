import type { InstagramProfileResponse } from "src/domain/types/instagram.types";
import type { TikTokProfileResponse } from "src/domain/types/tiktok.types";
import type { XPostsResponse } from "src/domain/types/x-posts.types";

interface ProfileScrapeResultBase {
  url: string;
  fetchedAt: string;
}

export interface ProfileScrapeResult extends ProfileScrapeResultBase {
  type: "instagram";
  raw: InstagramProfileResponse;
}
export interface XProfileScrapeResult extends ProfileScrapeResultBase {
  type: "x";
  raw: XPostsResponse;
}
export interface TikTokProfileScrapeResult extends ProfileScrapeResultBase {
  type: "tiktok";
  raw: TikTokProfileResponse;
}

export type AnyProfileScrapeResult =
  | ProfileScrapeResult
  | XProfileScrapeResult
  | TikTokProfileScrapeResult;
