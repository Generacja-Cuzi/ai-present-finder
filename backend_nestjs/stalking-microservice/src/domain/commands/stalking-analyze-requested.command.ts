import { AnalyzeRequestDto } from "../models/analyze-request.dto";

export class StalkingAnalyzeRequestedCommand {
  constructor(public readonly stalkingAnalyzeRequestDto: AnalyzeRequestDto) {}
}
