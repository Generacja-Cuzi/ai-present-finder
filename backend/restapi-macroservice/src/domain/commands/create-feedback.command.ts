import { Command } from "@nestjs/cqrs";

export interface FeedbackImageData {
  buffer: Buffer;
  mimeType: string;
  size: number;
}

export class CreateFeedbackCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly chatId: string,
    public readonly rating: number,
    public readonly comment: string | null,
    public readonly productId: string | null = null,
    public readonly isGeneralFeedback = false,
    public readonly images: FeedbackImageData[] = [],
  ) {
    super();
  }
}
