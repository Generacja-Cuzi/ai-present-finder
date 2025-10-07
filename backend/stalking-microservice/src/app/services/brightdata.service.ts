import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { ProfileScrapeResult } from "../../domain/models/profile-scrape-result.model";

type BrightDataResponse = unknown;

export interface ScrapeRequestItem {
  url: string;
  [key: string]: unknown;
}

@Injectable()
export class BrightDataService {
  private readonly logger = new Logger(BrightDataService.name);
  private readonly apiKey: string;
  private readonly datasetId: string;
  private readonly endpoint: string;
  private readonly customOutputFields?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService
      .get<string>("BRIGHTDATA_API_KEY", "")
      .trim();
    this.datasetId = this.configService
      .get<string>("BRIGHTDATA_DATASET_ID", "")
      .trim();
    this.endpoint = this.configService.get<string>(
      "BRIGHTDATA_ENDPOINT",
      "https://api.brightdata.com/datasets/v3/scrape",
    );
    const customOutputFields = this.configService.get<string>(
      "BRIGHTDATA_CUSTOM_OUTPUT_FIELDS",
    );
    const trimmedCustomOutputFields = customOutputFields?.trim();
    this.customOutputFields =
      trimmedCustomOutputFields !== undefined &&
      trimmedCustomOutputFields.length > 0
        ? trimmedCustomOutputFields
        : undefined;

    if (!this.apiKey) {
      throw new Error("Missing BRIGHTDATA_API_KEY");
    }

    if (!this.datasetId) {
      throw new Error("Missing BRIGHTDATA_DATASET_ID");
    }
  }

  async scrapeProfiles(
    items: ScrapeRequestItem[],
  ): Promise<ProfileScrapeResult[]> {
    const results: ProfileScrapeResult[] = [];

    for (const item of items) {
      try {
        const scrapeResult = await this.scrapeSingle(item);
        if (scrapeResult == null) {
          continue;
        }

        results.push(scrapeResult);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to scrape ${item.url}: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return results;
  }

  private async scrapeSingle(
    item: ScrapeRequestItem,
  ): Promise<ProfileScrapeResult | null> {
    const requestUrl = `${this.endpoint}?dataset_id=${encodeURIComponent(this.datasetId)}`;

    const body: Record<string, unknown> = {
      input: [item],
    };

    if (this.customOutputFields != null) {
      body.custom_output_fields = this.customOutputFields;
    }

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
      this.logger.error(
        `Bright Data error ${response.status.toString()}: ${errorText}`,
      );
      throw new Error(
        `Bright Data request failed with status ${response.status.toString()}`,
      );
    }

    const rawText = await response.text();

    let parsed: BrightDataResponse = rawText;
    try {
      parsed = JSON.parse(rawText) as BrightDataResponse;
    } catch {
      this.logger.debug("Bright Data response is not JSON, storing raw text");
    }

    return {
      source: this.detectSource(item.url),
      url: item.url,
      fetchedAt: new Date().toISOString(),
      raw: parsed,
    };
  }

  private detectSource(url: string): string {
    try {
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
    } catch {
      this.logger.warn(`Unable to detect source for url: ${url}`);
      return "unknown";
    }
  }
}
