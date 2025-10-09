import { StalkingCompletedEvent } from "@core/events";
import { StalkingAnalyzeCommand } from "src/domain/commands/stalking-analyze.command";
import { BrightDataService } from "src/app/services/brightdata.service";
import type { ScrapeRequestItem } from "src/app/services/brightdata.service";
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

    const keywords = this.extractFacts(profiles);

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

  private extractFacts(_profiles: AnyProfileScrapeResult[]): string[] {
    this.logger.log(_profiles);
    return ["hiking", "running"];
  }
}
