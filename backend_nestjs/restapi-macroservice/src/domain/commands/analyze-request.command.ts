import { AnalyzeRequestDto } from '../models/analyze-request.dto';

export class AnalyzeRequestCommand {
  constructor(public readonly analyzeRequestedDto: AnalyzeRequestDto) {}
}
