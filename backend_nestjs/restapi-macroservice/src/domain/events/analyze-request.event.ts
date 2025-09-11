export class AnalyzeRequestedEvent {
  constructor(
    public readonly facebookUrl: string,
    public readonly instagramUrl: string,
    public readonly tiktokUrl: string,
    public readonly youtubeUrl: string,
    public readonly xUrl: string,
    public readonly linkedinUrl: string,
  ) {}
}
