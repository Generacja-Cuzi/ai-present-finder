export class ChatRefinementStartedEvent {
  constructor(
    public readonly chatId: string,
    public readonly selectedListingIds: string[],
    public readonly selectedListings: Array<{
      id: string;
      title: string;
      description: string;
      category: string | null;
      provider: string;
      priceLabel: string | null;
    }>,
  ) {}
}
