export class GiftReadyEvent {
  constructor(
    public readonly giftIdeas: string[],
    public readonly chatId: string,
  ) {}
}
