import type { Listing } from "../entities/listing.entity";

export abstract class IListingRepository {
  abstract findById(id: string): Promise<Listing | null>;
  abstract findByChatId(chatId: string): Promise<Listing[]>;
  abstract findUserFavorites(userId: string): Promise<Listing[]>;
  abstract create(listingData: Partial<Listing>): Promise<Listing>;
  abstract update(id: string, listingData: Partial<Listing>): Promise<Listing>;
  abstract delete(id: string): Promise<void>;
  abstract addToUserFavorites(userId: string, listingId: string): Promise<void>;
  abstract removeFromUserFavorites(
    userId: string,
    listingId: string,
  ): Promise<void>;
  abstract isListingFavoritedByUser(
    userId: string,
    listingId: string,
  ): Promise<boolean>;
  abstract isOwnedByUser(listingId: string, userId: string): Promise<boolean>;
}
