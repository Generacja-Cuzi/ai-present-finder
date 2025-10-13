export class StalkingAnalyzeRequestedEvent {
  constructor(
    public readonly instagramUrl: string,
    public readonly tiktokUrl: string,
    public readonly xUrl: string,
    public readonly chatId: string,
  ) {}
}
