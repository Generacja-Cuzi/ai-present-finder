import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { UpdateProductRatingsCommand } from "../../domain/commands/update-product-ratings.command";
import { Product } from "../../domain/entities/product.entity";

@CommandHandler(UpdateProductRatingsCommand)
export class UpdateProductRatingsHandler
  implements ICommandHandler<UpdateProductRatingsCommand, Product[]>
{
  private readonly logger = new Logger(UpdateProductRatingsHandler.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async execute(command: UpdateProductRatingsCommand): Promise<Product[]> {
    const { products, scoredProducts, eventId } = command;

    const productEntityMap = new Map<string, Product>();
    for (const product of products) {
      productEntityMap.set(product.id, product);
    }

    const productsToUpdate: Product[] = [];
    for (const rankedProduct of scoredProducts) {
      const productEntity = productEntityMap.get(rankedProduct.id);
      if (productEntity === undefined) {
        this.logger.warn(`Product ${rankedProduct.id} not found in database`);
      } else {
        productEntity.rating = rankedProduct.score;
        productEntity.reasoning = rankedProduct.reasoning;
        productEntity.category = rankedProduct.category ?? null;
        productsToUpdate.push(productEntity);
      }
    }

    if (productsToUpdate.length > 0) {
      await this.productRepository.save(productsToUpdate);
      this.logger.log(
        `Updated ${String(productsToUpdate.length)} products with ratings and reasoning in session ${eventId}`,
      );
    }
    return productsToUpdate;
  }
}
