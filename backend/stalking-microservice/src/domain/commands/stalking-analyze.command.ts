import { Command } from "@nestjs/cqrs";

import type { StalkingAnalyzeRequestDto } from "../models/stalking-analyze-request.dto";

export class StalkingAnalyzeCommand extends Command<void> {
  constructor(
    public readonly stalkingAnalyzeRequestDto: StalkingAnalyzeRequestDto,
  ) {
    super();
  }
}
