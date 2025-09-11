export class ChatAskQuestionEvent {
  constructor(
    public readonly context: string,
    public readonly history: string[],
  ) {}
}
