export class StalkingCompletedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly chatId: string,
    public readonly completedAt: Date = new Date(),
  ) {}
}
