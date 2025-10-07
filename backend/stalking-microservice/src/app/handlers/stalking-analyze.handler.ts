import { StalkingCompletedEvent } from "@core/events";
import { StalkingAnalyzeCommand } from "src/domain/commands/stalking-analyze.command";
import { inspect } from "node:util";
import { BrightDataService } from "src/app/services/brightdata.service";
import type { ScrapeRequestItem } from "src/app/services/brightdata.service";
import type { ProfileScrapeResult } from "src/domain/models/profile-scrape-result.model";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

@CommandHandler(StalkingAnalyzeCommand)
export class StalkingAnalyzeHandler
  implements ICommandHandler<StalkingAnalyzeCommand>
{
  private static readonly STOP_WORDS = new Set([
    "the",
    "and",
    "for",
    "with",
    "about",
    "this",
    "that",
    "from",
    "have",
    "your",
    "you",
    "are",
    "was",
    "were",
    "will",
    "shall",
    "into",
    "their",
    "them",
    "they",
    "our",
    "we",
    "has",
    "had",
    "not",
    "but",
    "all",
    "can",
    "his",
    "her",
    "its",
    "www",
    "http",
    "https",
    "com",
    "facebook",
    "instagram",
    "linkedin",
    "tiktok",
    "youtube",
    "twitter",
    "likes",
    "comments",
    "shares",
  ]);

  private readonly logger = new Logger(StalkingAnalyzeHandler.name);
  constructor(
    private readonly brightDataService: BrightDataService,
    @Inject("STALKING_COMPLETED_EVENT") private readonly eventBus: ClientProxy,
  ) {}

  async execute(command: StalkingAnalyzeCommand) {
    this.logger.log("Starting stalking analysis...");

    const scrapeRequests = this.buildScrapeRequests(
      command.stalkingAnalyzeRequestDto,
    );

    if (scrapeRequests.length === 0) {
      this.logger.warn("No profile URLs provided. Skipping Bright Data call.");
    }

    const profiles =
      scrapeRequests.length > 0
        ? await this.brightDataService.scrapeProfiles(scrapeRequests)
        : [];

    const keywords = this.extractKeywords(profiles);

    const event = new StalkingCompletedEvent(
      keywords,
      command.stalkingAnalyzeRequestDto.chatId,
      profiles,
    );

    this.eventBus.emit(StalkingCompletedEvent.name, event);
    this.logger.log(
      `Published StalkingCompletedEvent with ${keywords.length.toString()} keywords and ${profiles.length.toString()} profiles scraped.`,
    );
  }

  private buildScrapeRequests(
    dto: StalkingAnalyzeCommand["stalkingAnalyzeRequestDto"],
  ): ScrapeRequestItem[] {
    const urls = [
      dto.facebookUrl,
      dto.instagramUrl,
      dto.tiktokUrl,
      dto.youtubeUrl,
      dto.xUrl,
      dto.linkedinUrl,
    ]
      .filter((url): url is string => typeof url === "string")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const uniqueUrls = [...new Set(urls)];
    return uniqueUrls.map((url) => ({ url }));
  }

  private extractKeywords(profiles: ProfileScrapeResult[]): string[] {
    const frequencies = new Map<string, number>();

    for (const profile of profiles) {
      const rawText = this.stringifyRaw(profile.raw);
      const combinedText = `${profile.source} ${profile.url} ${rawText}`;
      const tokens = combinedText.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu);

      if (tokens === null) {
        continue;
      }

      for (const token of tokens) {
        if (StalkingAnalyzeHandler.STOP_WORDS.has(token)) {
          continue;
        }

        const score = frequencies.get(token) ?? 0;
        frequencies.set(token, score + 1);
      }
    }

    if (frequencies.size === 0) {
      return [
        ...new Set(
          profiles
            .map((profile) => profile.source)
            .filter((source) => source.length > 0),
        ),
      ];
    }

    return [...frequencies.entries()]
      .toSorted((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([token]) => token);
  }

  private stringifyRaw(raw: unknown): string {
    if (raw == null) {
      return "";
    }

    if (typeof raw === "string") {
      return raw;
    }

    try {
      return JSON.stringify(raw);
    } catch {
      return inspect(raw, { depth: 2, maxArrayLength: 20 });
    }
  }
}
