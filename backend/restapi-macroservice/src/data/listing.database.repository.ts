import type { Listing } from "src/domain/entities/listing.entity";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";
import { Repository } from "typeorm";

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Listing as ListingEntity } from "../domain/entities/listing.entity";
import { User } from "../domain/entities/user.entity";

@Injectable()
export class ListingDatabaseRepository implements IListingRepository {
  constructor(
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<Listing | null> {
    return this.listingRepository.findOne({
      where: { id },
      relations: ["favoritedBy"],
    });
  }

  async findByChatId(chatId: string): Promise<Listing[]> {
    return this.listingRepository.find({
      where: { chatId },
      order: { createdAt: "DESC" },
    });
  }

  async findUserFavorites(userId: string): Promise<Listing[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["favoriteListings"],
    });

    return user?.favoriteListings ?? [];
  }

  async create(listingData: Partial<Listing>): Promise<Listing> {
    const listing = this.listingRepository.create(listingData);
    return this.listingRepository.save(listing);
  }

  async update(id: string, listingData: Partial<Listing>): Promise<Listing> {
    await this.listingRepository.update(id, listingData);
    const updatedListing = await this.findById(id);
    if (updatedListing === null) {
      throw new NotFoundException(`Listing with id ${id} not found`);
    }
    return updatedListing;
  }

  async delete(id: string): Promise<void> {
    await this.listingRepository.delete(id);
  }

  async addToUserFavorites(userId: string, listingId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["favoriteListings"],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with id ${listingId} not found`);
    }

    // Check if already favorited
    const alreadyFavorited = user.favoriteListings.some(
      (l) => l.id === listingId,
    );

    if (!alreadyFavorited) {
      user.favoriteListings.push(listing);
      await this.userRepository.save(user);
    }
  }

  async removeFromUserFavorites(
    userId: string,
    listingId: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["favoriteListings"],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    user.favoriteListings = user.favoriteListings.filter(
      (l) => l.id !== listingId,
    );
    await this.userRepository.save(user);
  }

  async isListingFavoritedByUser(
    userId: string,
    listingId: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["favoriteListings"],
    });

    if (!user) {
      return false;
    }

    return user.favoriteListings.some((l) => l.id === listingId);
  }
}
