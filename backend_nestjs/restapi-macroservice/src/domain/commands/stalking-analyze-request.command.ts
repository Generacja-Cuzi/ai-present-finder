import { StalkingAnalyzeRequestDto } from '../models/stalking-analyze-request.dto';

export class StalkingAnalyzeRequestCommand {
  constructor(public readonly analyzeRequestedDto: StalkingAnalyzeRequestDto) {}
}
