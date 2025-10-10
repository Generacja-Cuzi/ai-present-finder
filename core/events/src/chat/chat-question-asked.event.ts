export class ChatQuestionAskedEvent {
  constructor(
    public readonly chatId: string,
    public readonly question: string,
  ) {}
}
