export class StalkingCompletedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly completedAt: Date,
  ) {}
}
