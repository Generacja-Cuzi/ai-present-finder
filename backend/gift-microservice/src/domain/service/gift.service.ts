import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Gift } from "../models/gift.entity";

export interface CreateGiftDto {
  name: string;
  description?: string;
  price: number;
  category?: string;
}

export interface UpdateGiftDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
}

@Injectable()
export class GiftService {
  constructor(
    @InjectRepository(Gift)
    private readonly giftRepository: Repository<Gift>,
  ) {}

  async create(createGiftDto: CreateGiftDto): Promise<Gift> {
    const gift = this.giftRepository.create(createGiftDto);
    return await this.giftRepository.save(gift);
  }

  async findAll(): Promise<Gift[]> {
    return await this.giftRepository.find();
  }

  async findOne(id: string): Promise<Gift | null> {
    return await this.giftRepository.findOne({ where: { id } });
  }

  async update(id: string, updateGiftDto: UpdateGiftDto): Promise<Gift | null> {
    await this.giftRepository.update(id, updateGiftDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.giftRepository.delete(id);
  }
}
