import { Command } from "@nestjs/cqrs";

import { StalkingAnalyzeRequestDto } from "../models/stalking-analyze-request.dto";

export class StalkingAnalyzeRequestCommand extends Command<void> {
  constructor(public readonly analyzeRequestedDto: StalkingAnalyzeRequestDto) {
    super();
  }
}
