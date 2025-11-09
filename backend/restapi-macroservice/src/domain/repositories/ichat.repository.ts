import type { Chat } from "../entities/chat.entity";

export abstract class IChatRepository {
  abstract findById(id: string): Promise<Chat | null>;
  abstract findByChatId(chatId: string): Promise<Chat | null>;
  abstract findByChatIdWithListings(chatId: string): Promise<Chat | null>;
  abstract findByUserId(userId: string): Promise<Chat[]>;
  abstract create(chatData: Partial<Chat>): Promise<Chat>;
  abstract update(id: string, chatData: Partial<Chat>): Promise<Chat>;
  abstract delete(id: string): Promise<void>;
  abstract isOwnedByUser(chatId: string, userId: string): Promise<boolean>;
}
