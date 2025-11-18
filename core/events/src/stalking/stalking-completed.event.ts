export class StalkingCompletedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly chatId: string,
    public readonly minPrice?: number,
    public readonly maxPrice?: number,
    public readonly completedAt: Date = new Date(),
  ) {}
}
