import type { Chat } from "src/domain/entities/chat.entity";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Chat as ChatEntity } from "../domain/entities/chat.entity";

@Injectable()
export class ChatDatabaseRepository implements IChatRepository {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {}

  async findById(id: string): Promise<Chat | null> {
    return this.chatRepository.findOne({ where: { id } });
  }

  async findByChatId(chatId: string): Promise<Chat | null> {
    return this.chatRepository.findOne({ where: { chatId } });
  }

  async findByUserId(userId: string): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async create(chatData: Partial<Chat>): Promise<Chat> {
    const chat = this.chatRepository.create(chatData);
    return this.chatRepository.save(chat);
  }

  async update(id: string, chatData: Partial<Chat>): Promise<Chat> {
    await this.chatRepository.update(id, chatData);
    const updatedChat = await this.findById(id);
    if (updatedChat === null) {
      throw new Error(`Chat with id ${id} not found`);
    }
    return updatedChat;
  }

  async delete(id: string): Promise<void> {
    await this.chatRepository.delete(id);
  }

  async isOwnedByUser(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.chatRepository.findOne({
      where: { chatId, userId },
    });
    return chat !== null;
  }
}
