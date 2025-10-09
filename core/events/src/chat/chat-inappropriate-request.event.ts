export class ChatInappropriateRequestEvent {
  constructor(
    public readonly reason: string,
    public readonly chatId: string,
  ) {}
}
