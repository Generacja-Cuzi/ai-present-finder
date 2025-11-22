export class StartChatRefinementCommand {
  constructor(
    public readonly chatId: string,
    public readonly selectedListingIds: string[],
  ) {}
}
