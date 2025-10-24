type PotencialAnswers =
  | {
      type: "select";
      answers: {
        answerFullSentence: string;
        answerShortForm: string;
      }[];
    }
  | {
      type: "long_free_text";
    };

export class ChatQuestionAskedEvent {
  constructor(
    public readonly chatId: string,
    public readonly question: string,
    public readonly potentialAnswers: PotencialAnswers | null,
  ) {}
}
