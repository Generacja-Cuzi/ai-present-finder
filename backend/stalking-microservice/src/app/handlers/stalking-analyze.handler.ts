import { StalkingCompletedEvent } from "@core/events";
import type { UserContent } from "ai";
import { extractFacts } from "src/app/ai/flow";
import { BrightDataService } from "src/app/services/brightdata.service";
import type { ScrapeRequestItem } from "src/app/services/brightdata.service";
import { StalkingAnalyzeCommand } from "src/domain/commands/stalking-analyze.command";
import type { AnyProfileScrapeResult } from "src/domain/models/profile-scrape-result.model";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

@CommandHandler(StalkingAnalyzeCommand)
export class StalkingAnalyzeHandler
  implements ICommandHandler<StalkingAnalyzeCommand>
{
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

    const keywords = await this.extractFactsFromProfiles(profiles);

    const event = new StalkingCompletedEvent(
      keywords,
      command.stalkingAnalyzeRequestDto.chatId,
    );

    this.eventBus.emit(StalkingCompletedEvent.name, event);
    this.logger.log(
      `Published StalkingCompletedEvent with ${keywords.length.toString()} keywords.`,
    );
  }

  private buildScrapeRequests(
    dto: StalkingAnalyzeCommand["stalkingAnalyzeRequestDto"],
  ): ScrapeRequestItem[] {
    const urls = [dto.instagramUrl, dto.tiktokUrl, dto.xUrl]
      .filter((url): url is string => typeof url === "string")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const uniqueUrls = [...new Set(urls)];
    return uniqueUrls.map((url) => ({ url }));
  }

  private async extractFactsFromProfiles(
    profiles: AnyProfileScrapeResult[],
  ): Promise<string[]> {
    if (profiles.length === 0) {
      this.logger.warn("No profiles to extract facts from.");
      return [];
    }

    try {
      this.logger.log(
        `Extracting facts from ${profiles.length.toString()} profile(s)...`,
      );

      // Process each profile concurrently with its images
      const factExtractionPromises = profiles.map(async (profile) =>
        this.extractFactsFromSingleProfile(profile),
      );

      const allFactsArrays = await Promise.all(factExtractionPromises);

      // Flatten and deduplicate facts from all profiles
      const allFacts = allFactsArrays.flat();
      const uniqueFacts = [...new Set(allFacts)];

      this.logger.log(
        `Extracted ${uniqueFacts.length.toString()} unique facts from ${profiles.length.toString()} profile(s).`,
      );

      return uniqueFacts;
    } catch (error) {
      this.logger.error("Failed to extract facts from profiles:", error);
      return [];
    }
  }

  private async extractFactsFromSingleProfile(
    profile: AnyProfileScrapeResult,
  ): Promise<string[]> {
    try {
      const { textSummary, imageUrls } = this.extractProfileContent(profile);

      // Build multimodal content array with text and images
      const content: UserContent = [
        {
          type: "text",
          text: `Analyze this social media profile and extract relevant facts for gift suggestions:\n\n${textSummary}`,
        },
      ];

      // Add images (limit to avoid token overflow)
      const maxImages = 10;
      const imagesToProcess = imageUrls.slice(0, maxImages);

      for (const imageUrl of imagesToProcess) {
        content.push({
          type: "image",
          image: new URL(imageUrl),
        });
      }

      this.logger.log(
        `Processing profile ${profile.url} with ${imageUrls.length.toString()} images (using ${imagesToProcess.length.toString()})`,
      );

      // Call AI to extract facts with multimodal content
      const result = await extractFacts({
        input: {
          role: "user",
          content,
        },
      });

      this.logger.log(
        `Extracted ${result.facts.length.toString()} facts from profile ${profile.url}`,
        { detail: result.facts },
      );
      return result.facts;
    } catch (error) {
      this.logger.error(
        `Failed to extract facts from profile ${profile.url}:`,
        error,
      );
      return [];
    }
  }

  private extractProfileContent(profile: AnyProfileScrapeResult): {
    textSummary: string;
    imageUrls: string[];
  } {
    switch (profile.type) {
      case "instagram": {
        // Instagram response is an array, take first account
        const account = profile.raw.at(0);

        if (account === undefined) {
          return {
            textSummary: `Instagram Profile (${profile.url}): No data available`,
            imageUrls: [],
          };
        }

        const bio = account.biography;
        const fullName = account.full_name;
        const posts = account.posts
          .slice(0, 10)
          .map((post) => post.caption)
          .filter(Boolean)
          .join(" | ");

        const imageUrls = [
          account.profile_image_link,
          ...account.posts.slice(0, 15).map((post) => post.image_url),
        ].filter(Boolean);

        const textSummary = `Instagram Profile (${profile.url}):\nName: ${fullName}\nBio: ${bio}\nRecent posts: ${posts}`;

        return { textSummary, imageUrls };
      }
      case "x": {
        // X response is an array of posts
        const posts = profile.raw.slice(0, 10);
        const userInfo = profile.raw.at(0);

        if (userInfo === undefined) {
          return {
            textSummary: `X/Twitter Profile (${profile.url}): No data available`,
            imageUrls: [],
          };
        }

        const bio = userInfo.biography;
        const name = userInfo.name;
        const descriptions = posts
          .map((post) => post.description)
          .filter(Boolean)
          .join(" | ");

        const imageUrls = [
          userInfo.profile_image_link,
          ...posts.flatMap((post) => post.photos),
        ].filter(Boolean);

        const textSummary = `X/Twitter Profile (${profile.url}):\nName: ${name}\nBio: ${bio}\nRecent posts: ${descriptions}`;

        return { textSummary, imageUrls };
      }
      case "tiktok": {
        // TikTok response is an array, take first profile
        const tikTokProfile = profile.raw.at(0);

        if (tikTokProfile === undefined) {
          return {
            textSummary: `TikTok Profile (${profile.url}): No data available`,
            imageUrls: [],
          };
        }

        const bio = tikTokProfile.biography;
        const signature = tikTokProfile.signature;
        const nickname = tikTokProfile.nickname;
        const topPosts = tikTokProfile.top_posts_data
          .slice(0, 10)
          .map((post) => post.description)
          .filter(Boolean)
          .join(" | ");

        const imageUrls = [
          tikTokProfile.profile_pic_url_hd,
          tikTokProfile.profile_pic_url,
          ...tikTokProfile.top_videos
            .slice(0, 15)
            .map((video) => video.cover_image),
        ].filter(Boolean);

        const textSummary = `TikTok Profile (${profile.url}):\nNickname: ${nickname}\nBio: ${bio}\nSignature: ${signature}\nTop posts: ${topPosts}`;

        return { textSummary, imageUrls };
      }
      default: {
        const _exhaustiveCheck: never = profile;
        // @ts-expect-error - This is to ensure exhaustive checking
        throw new Error(`Unhandled profile type: ${profile.type as string}`);
      }
    }
  }
}
