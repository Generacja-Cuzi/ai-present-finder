import type { Feedback } from "../entities/feedback.entity";

export abstract class IFeedbackRepository {
  abstract findById(id: string): Promise<Feedback | null>;
  abstract findByChatId(chatId: string): Promise<Feedback[]>;
  abstract findByUserId(userId: string): Promise<Feedback[]>;
  abstract findAll(): Promise<Feedback[]>;
  abstract create(feedbackData: Partial<Feedback>): Promise<Feedback>;
  abstract update(
    id: string,
    feedbackData: Partial<Feedback>,
  ): Promise<Feedback>;
  abstract delete(id: string): Promise<void>;
  abstract existsByChatId(chatId: string): Promise<boolean>;
  abstract findByChatIdAndProductId(
    chatId: string,
    productId: string,
  ): Promise<Feedback | null>;
  abstract findGeneralByChatId(chatId: string): Promise<Feedback | null>;
}
