export class StalkingAnalyzeRequestedEvent {
  constructor(
    public readonly instagramUrl: string,
    public readonly tiktokUrl: string,
    public readonly xUrl: string,
    public readonly chatId: string,
    public readonly minPrice?: number,
    public readonly maxPrice?: number,
  ) {}
}
