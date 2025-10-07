import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { AllegroProduct } from "../models/allegro-product.entity";

export interface CreateAllegroProductDto {
  name: string;
  description?: string;
  price: number;
  url?: string;
}

export interface UpdateAllegroProductDto {
  name?: string;
  description?: string;
  price?: number;
  url?: string;
}

@Injectable()
export class AllegroProductService {
  constructor(
    @InjectRepository(AllegroProduct)
    private readonly allegroProductRepository: Repository<AllegroProduct>,
  ) {}

  async create(
    createProductDto: CreateAllegroProductDto,
  ): Promise<AllegroProduct> {
    const product = this.allegroProductRepository.create(createProductDto);
    return await this.allegroProductRepository.save(product);
  }

  async findAll(): Promise<AllegroProduct[]> {
    return await this.allegroProductRepository.find();
  }

  async findOne(id: string): Promise<AllegroProduct | null> {
    return await this.allegroProductRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateProductDto: UpdateAllegroProductDto,
  ): Promise<AllegroProduct | null> {
    await this.allegroProductRepository.update(id, updateProductDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.allegroProductRepository.delete(id);
  }
}
