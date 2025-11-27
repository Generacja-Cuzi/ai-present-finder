import type { FeedbackImage } from "../entities/feedback-image.entity";

export abstract class IFeedbackImageRepository {
  abstract create(imageData: Partial<FeedbackImage>): Promise<FeedbackImage>;
  abstract findById(id: string): Promise<FeedbackImage | null>;
  abstract findByFeedbackId(feedbackId: string): Promise<FeedbackImage[]>;
  abstract deleteByFeedbackId(feedbackId: string): Promise<void>;
}
