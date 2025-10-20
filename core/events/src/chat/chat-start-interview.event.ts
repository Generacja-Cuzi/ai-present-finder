export class ChatStartInterviewEvent {
  constructor(
    public readonly chatId: string,
    public readonly occasion: string,
  ) {}
}
