export class GiftGenerateRequestedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly chatId: string,
  ) {}
}
