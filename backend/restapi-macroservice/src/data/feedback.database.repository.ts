import type { Feedback } from "src/domain/entities/feedback.entity";
import { IFeedbackRepository } from "src/domain/repositories/ifeedback.repository";
import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Feedback as FeedbackEntity } from "../domain/entities/feedback.entity";

@Injectable()
export class FeedbackDatabaseRepository implements IFeedbackRepository {
  constructor(
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
  ) {}

  async findById(id: string): Promise<Feedback | null> {
    return this.feedbackRepository.findOne({ where: { id } });
  }

  async findByChatId(chatId: string): Promise<Feedback | null> {
    return this.feedbackRepository.findOne({ where: { chatId } });
  }

  async findByUserId(userId: string): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      order: { createdAt: "DESC" },
      relations: ["user", "chat"],
    });
  }

  async create(feedbackData: Partial<Feedback>): Promise<Feedback> {
    const feedback = this.feedbackRepository.create(feedbackData);
    return this.feedbackRepository.save(feedback);
  }

  async update(id: string, feedbackData: Partial<Feedback>): Promise<Feedback> {
    await this.feedbackRepository.update(id, feedbackData);
    const updatedFeedback = await this.findById(id);
    if (updatedFeedback === null) {
      throw new Error(`Feedback with id ${id} not found`);
    }
    return updatedFeedback;
  }

  async delete(id: string): Promise<void> {
    await this.feedbackRepository.delete(id);
  }

  async existsByChatId(chatId: string): Promise<boolean> {
    const count = await this.feedbackRepository.count({ where: { chatId } });
    return count > 0;
  }
}
