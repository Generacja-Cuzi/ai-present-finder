import type { Message } from "../entities/message.entity";

export abstract class IMessageRepository {
  abstract findById(id: string): Promise<Message | null>;
  abstract findByChatId(chatId: string): Promise<Message[]>;
  abstract create(messageData: Partial<Message>): Promise<Message>;
  abstract delete(id: string): Promise<void>;
}
