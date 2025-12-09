export type ProgressStage =
  | "stalking"
  | "interview"
  | "ideas"
  | "fetching"
  | "reranking";

export class ProgressUpdateEvent {
  constructor(
    public readonly chatId: string,
    public readonly stage: ProgressStage,
    public readonly percentage: number,
    public readonly message: string,
  ) {}
}
