import type { Message } from "src/domain/entities/message.entity";
import { IMessageRepository } from "src/domain/repositories/imessage.repository";
import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Message as MessageEntity } from "../domain/entities/message.entity";

@Injectable()
export class MessageDatabaseRepository implements IMessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async findById(id: string): Promise<Message | null> {
    return this.messageRepository.findOne({ where: { id } });
  }

  async findByChatId(chatId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { chatId },
      order: { createdAt: "ASC" },
    });
  }

  async create(messageData: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(messageData);
    return this.messageRepository.save(message);
  }

  async delete(id: string): Promise<void> {
    await this.messageRepository.delete(id);
  }

  async isOwnedByUser(messageId: string, userId: string): Promise<boolean> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ["chat"],
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (message === null || message === undefined) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return message.chat?.userId === userId;
  }
}
