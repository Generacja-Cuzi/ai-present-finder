import type { FeedbackImage } from "src/domain/entities/feedback-image.entity";
import { IFeedbackImageRepository } from "src/domain/repositories/ifeedback-image.repository";
import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { FeedbackImage as FeedbackImageEntity } from "../domain/entities/feedback-image.entity";

@Injectable()
export class FeedbackImageDatabaseRepository
  implements IFeedbackImageRepository
{
  constructor(
    @InjectRepository(FeedbackImageEntity)
    private readonly feedbackImageRepository: Repository<FeedbackImageEntity>,
  ) {}

  async create(imageData: Partial<FeedbackImage>): Promise<FeedbackImage> {
    const image = this.feedbackImageRepository.create(imageData);
    return this.feedbackImageRepository.save(image);
  }

  async findById(id: string): Promise<FeedbackImage | null> {
    return this.feedbackImageRepository.findOne({ where: { id } });
  }

  async findByFeedbackId(feedbackId: string): Promise<FeedbackImage[]> {
    return this.feedbackImageRepository.find({
      where: { feedbackId },
      order: { createdAt: "ASC" },
    });
  }

  async deleteByFeedbackId(feedbackId: string): Promise<void> {
    await this.feedbackImageRepository.delete({ feedbackId });
  }
}
