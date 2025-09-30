import { StalkingAnalyzeRequestDto } from "../models/stalking-analyze-request.dto";

export class StalkingAnalyzeCommand {
  constructor(
    public readonly stalkingAnalyzeRequestDto: StalkingAnalyzeRequestDto,
  ) {}
}
