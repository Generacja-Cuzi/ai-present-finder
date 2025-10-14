import { readFileSync } from "node:fs";
import path from "node:path";
import type { InstagramProfileResponse } from "src/domain/types/instagram.types";
import type { TikTokProfileResponse } from "src/domain/types/tiktok.types";
import type { XPostsResponse } from "src/domain/types/x-posts.types";
import type { EnvironmentVariables } from "src/webapi/config/environment.config";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AnyProfileScrapeResult } from "../../domain/models/profile-scrape-result.model";

type BrightDataResponse =
  | InstagramProfileResponse
  | TikTokProfileResponse
  | XPostsResponse;

export interface ScrapeRequestItem {
  url: string;
  [key: string]: unknown;
}

type DatasetMap = Record<string, string>;

// Dataset IDs from Bright Data's public catalog
export const DATASET_MAP: DatasetMap = {
  // Social Media - Profiles
  facebook: "gd_lkaxegm826bjpoo9m5", // Facebook - Pages Posts by Profile URL
  instagram: "gd_l1vikfch901nx3by4", // Instagram - Profiles
  tiktok: "gd_l1villgoiiidt09ci", // TikTok - Profiles
  youtube: "gd_lk538t2k2p1k3oos71", // YouTube - Profiles
  linkedin: "gd_l1viktl72bvl7bjuj0", // LinkedIn people profiles
  x: "gd_lwxmeb2u1cniijd7t4", // X (formerly Twitter) - Profiles
  twitter: "gd_lwxmeb2u1cniijd7t4", // X (formerly Twitter) - Profiles (alias)

  // Social Media - Posts
  "facebook-posts": "gd_lyclm1571iy3mv57zw", // Facebook - Posts by post URL
  "facebook-reels": "gd_lyclm3ey2q6rww027t", // Facebook - Reels by profile URL
  "facebook-groups": "gd_lz11l67o2cb3r0lkj3", // Facebook - Posts by group URL
  "instagram-posts": "gd_lk5ns7kz21pck8jpis", // Instagram - Posts
  "instagram-reels": "gd_lyclm20il4r5helnj", // Instagram - Reels
  "tiktok-posts": "gd_lu702nij2f790tmv9h", // TikTok - Posts
  "youtube-videos": "gd_lk56epmy2i5g7lzu0k", // Youtube - Videos posts
  "x-posts": "gd_lwxkxvnf1cynvib9co", // X (formerly Twitter) - Posts
  "linkedin-posts": "gd_lyy3tktm25m4avu764", // LinkedIn posts
  "pinterest-posts": "gd_lk0sjs4d21kdr7cnlv", // Pinterest - Posts
  "reddit-posts": "gd_lvz8ah06191smkebj4", // Reddit- Posts

  // Social Media - Comments
  "facebook-comments": "gd_lkay758p1eanlolqw8", // Facebook - Comments
  "instagram-comments": "gd_ltppn085pokosxh13", // Instagram - Comments
  "tiktok-comments": "gd_lkf2st302ap89utw5k", // TikTok - Comments
  "youtube-comments": "gd_lk9q0ew71spt1mxywf", // Youtube - Comments
  "reddit-comments": "gd_lvzdpsdlw09j6t702", // Reddit - Comments

  // Other Social Platforms
  pinterest: "gd_lk0zv93c2m9qdph46z", // Pinterest - Profiles
  bluesky: "gd_m45p78dl1m017wi5lj", // Top 500 Bluesky Profiles
  "bluesky-posts": "gd_m6hn4r5s27zfhc7w4", // Bluesky - Posts
  vimeo: "gd_lxk88z3v1ketji4pn", // Vimeo - Videos posts
  quora: "gd_lvz1rbj81afv3m6n5y", // Quora posts

  // Business & Professional
  crunchbase: "gd_l1vijqt9jfj7olije", // Crunchbase companies information
  "linkedin-companies": "gd_l1vikfnt1wgvvqz95w", // LinkedIn company information
  "linkedin-jobs": "gd_lpfll7v5hcqtkxl6l", // Linkedin job listings information
  zoominfo: "gd_m0ci4a4ivx3j5l6nx", // Zoominfo companies information
  pitchbook: "gd_m4ijiqfp2n9oe3oluj", // pitchbook companies information

  // Reviews & Ratings
  yelp: "gd_lgugwl0519h1p14rwk", // Yelp businesses overview
  "yelp-reviews": "gd_lgzhlu9323u3k24jkv", // Yelp businesses reviews
  trustpilot: "gd_lm5zmhwd2sni130p", // Trustpilot business reviews
  glassdoor: "gd_l7j0bx501ockwldaqf", // Glassdoor companies overview information
  "glassdoor-reviews": "gd_l7j1po0921hbu0ri1z", // Glassdoor companies reviews
  "google-maps": "gd_m8ebnr0q2qlklc02fz", // Google Maps full information
  "google-maps-reviews": "gd_luzfs1dn2oa0teb81", // Google maps reviews

  // E-commerce
  amazon: "gd_l7q7dkf244hwjntr0", // Amazon products
  "amazon-search": "gd_lwdb4vjm1ehb499uxs", // Amazon products search
  "amazon-reviews": "gd_le8e811kzy4ggddlq", // Amazon Reviews
  walmart: "gd_l95fol7l1ru6rlo116", // Walmart - products
  ebay: "gd_ltr9mjt81n0zzdk1fb", // eBay
  etsy: "gd_ltppk0jdv1jqz25mz", // Etsy
  target: "gd_ltppk5mx2lp0v1k0vo", // Target

  // News & Media
  wikipedia: "gd_lr9978962kkjr3nx49", // Wikipedia articles
  "google-news": "gd_lnsxoxzi1omrwnka5r", // Google News
  bbc: "gd_ly5lkfzd1h8c85feyh", // BBC news
  cnn: "gd_lycz8783197ch4wvwg", // CNN news

  // Development
  github: "gd_lyrexgxc24b3d4imjt", // Github repository

  // App Stores
  "google-play": "gd_lsk382l8xei8vzm4u", // Google Play Store
  "google-play-reviews": "gd_m6zagkt024uwvvwuyu", // Google Play Store reviews
  "app-store": "gd_lsk9ki3u2iishmwrui", // Apple App Store
  "app-store-reviews": "gd_m734msue16e0adkbit", // Apple App Store reviews
};

@Injectable()
export class BrightDataService {
  private readonly logger = new Logger(BrightDataService.name);
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly useMockData: boolean;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.apiKey = this.configService.get("BRIGHTDATA_API_KEY", {
      infer: true,
    });
    this.endpoint = this.configService.get("BRIGHTDATA_ENDPOINT", {
      infer: true,
    });
    this.useMockData = this.configService.get("USE_MOCK_DATA", {
      infer: true,
    });

    if (!this.apiKey && !this.useMockData) {
      throw new Error("Missing BRIGHTDATA_API_KEY");
    }

    if (this.useMockData) {
      this.logger.warn(
        "🔧 Mock data mode is enabled. Scraping will use local mock files.",
      );
    }
  }

  async scrapeProfiles(
    items: ScrapeRequestItem[],
  ): Promise<AnyProfileScrapeResult[]> {
    // Filter out items with empty or whitespace-only URLs
    const filteredItems = items.filter(
      (item) => typeof item.url === "string" && item.url.trim().length > 0,
    );
    const skipped = items.length - filteredItems.length;
    if (skipped > 0) {
      this.logger.warn(
        `Filtered out ${String(skipped)} item(s) with empty URL`,
      );
    }

    const results: AnyProfileScrapeResult[] = [];
    const settled = await Promise.all(
      filteredItems.map(async (item) => {
        try {
          const scrapeResult = await this.scrapeSingle(item);
          return { success: true, item, scrapeResult };
        } catch (error) {
          return { success: false, item, error: error as unknown };
        }
      }),
    );

    for (const outcome of settled) {
      const result = outcome;
      if (result.success) {
        if (result.scrapeResult != null) {
          results.push(result.scrapeResult);
        }
      } else {
        const error =
          result.error instanceof Error
            ? result.error
            : new Error(String(result.error));
        this.logger.error(
          `Failed to scrape ${result.item.url}: ${error.message}`,
          error.stack,
        );
      }
    }

    return results;
  }

  private async scrapeSingle(
    item: ScrapeRequestItem,
  ): Promise<AnyProfileScrapeResult | null> {
    if (this.useMockData) {
      return this.loadMockData(item);
    }

    const datasetId = this.resolveDatasetId(item);
    const requestUrl = `${this.endpoint}?dataset_id=${encodeURIComponent(datasetId)}`;

    const body: Record<string, unknown> = {
      input: [item],
    };

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 202) {
      const timeoutPayload = (await response
        .json()
        .catch(() => null)) as unknown;

      let message = "Bright Data request accepted but still processing";
      if (
        timeoutPayload != null &&
        typeof timeoutPayload === "object" &&
        "message" in timeoutPayload &&
        typeof (timeoutPayload as { message: unknown }).message === "string"
      ) {
        message = (timeoutPayload as { message: string }).message;
      }
      this.logger.warn(message);
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Bright Data request failed with status ${response.status.toString()}: ${errorText}`,
      );
    }

    const rawText = await response.text();

    let parsed: unknown = rawText;
    try {
      parsed = JSON.parse(rawText) as BrightDataResponse;
    } catch {
      this.logger.debug("Bright Data response is not JSON, storing raw text");
    }

    const source = this.detectSource(item.url);
    switch (source) {
      case "instagram": {
        return {
          type: "instagram",
          url: item.url,
          fetchedAt: new Date().toISOString(),
          raw: parsed as InstagramProfileResponse,
        };
      }
      case "tiktok": {
        return {
          type: "tiktok",
          url: item.url,
          fetchedAt: new Date().toISOString(),
          raw: parsed as TikTokProfileResponse,
        };
      }
      case "x":
      case "twitter": {
        return {
          type: "x",
          url: item.url,
          fetchedAt: new Date().toISOString(),
          raw: parsed as XPostsResponse,
        };
      }
      default: {
        this.logger.warn(`Unsupported source: ${source}`);
        return null;
      }
    }
  }

  public resolveDatasetId(item: ScrapeRequestItem): string {
    // Check for explicit dataset ID first
    if (item.datasetId != null && typeof item.datasetId === "string") {
      return item.datasetId;
    }

    const source = this.detectSource(item.url);

    const datasetId = DATASET_MAP[source];

    if (datasetId == null) {
      throw new Error(`No dataset ID configured for source: ${source}`);
    }

    return datasetId;
  }

  private detectSource(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("facebook")) {
      return "facebook";
    }
    if (hostname.includes("instagram")) {
      return "instagram";
    }
    if (hostname.includes("tiktok")) {
      return "tiktok";
    }
    if (hostname.includes("youtube")) {
      return "youtube";
    }
    if (hostname.includes("linkedin")) {
      return "linkedin";
    }
    if (hostname.endsWith("x.com") || hostname.includes("twitter")) {
      return "x";
    }
    return hostname;
  }

  private loadMockData(item: ScrapeRequestItem): AnyProfileScrapeResult | null {
    const source = this.detectSource(item.url);

    this.logger.debug(`Loading mock data for ${source} profile: ${item.url}`);

    switch (source) {
      case "instagram": {
        const mockFilePath = path.join(
          process.cwd(),
          "src",
          "app",
          "services",
          "instagram_mock_response.json",
        );
        const mockDataRaw = readFileSync(mockFilePath, "utf8");
        const parsed = JSON.parse(mockDataRaw) as InstagramProfileResponse;

        return {
          type: "instagram",
          url: item.url,
          fetchedAt: new Date().toISOString(),
          raw: parsed,
        };
      }
      case "tiktok": {
        // TODO: Add TikTok mock data when available
        this.logger.warn("TikTok mock data not yet implemented");
        return null;
      }
      case "x":
      case "twitter": {
        // TODO: Add X/Twitter mock data when available
        this.logger.warn("X/Twitter mock data not yet implemented");
        return null;
      }
      default: {
        this.logger.warn(`Mock data not available for source: ${source}`);
        return null;
      }
    }
  }
}
