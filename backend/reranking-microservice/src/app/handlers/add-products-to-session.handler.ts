import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { AddProductsToSessionCommand } from "../../domain/commands/add-products-to-session.command";
import { GiftSessionProduct } from "../../domain/entities/gift-session-product.entity";
import { GiftSession } from "../../domain/entities/gift-session.entity";
import { Product } from "../../domain/entities/product.entity";

@CommandHandler(AddProductsToSessionCommand)
export class AddProductsToSessionHandler
  implements ICommandHandler<AddProductsToSessionCommand, void>
{
  private readonly logger = new Logger(AddProductsToSessionHandler.name);

  constructor(
    @InjectRepository(GiftSessionProduct)
    private readonly sessionProductRepository: Repository<GiftSessionProduct>,
  ) {}

  async execute(command: AddProductsToSessionCommand): Promise<void> {
    const {
      eventId,
      products,
      sourceEventName,
      sourceEventProvider,
      sourceEventSuccess,
    } = command;

    const sessionExists = await this.sessionProductRepository.manager
      .getRepository(GiftSession)
      .exists({ where: { eventId } });

    if (!sessionExists) {
      this.logger.error(`Session ${eventId} not found, cannot add products`);
      throw new Error(`Session ${eventId} does not exist`);
    }

    const productEntities = products.map((listing) => {
      const product = new Product();
      product.image = listing.image;
      product.title = listing.title;
      product.description = listing.description;
      product.link = listing.link;
      product.priceValue = listing.price.value ?? null;
      product.priceLabel = listing.price.label ?? null;
      product.priceCurrency = listing.price.currency ?? null;
      product.priceNegotiable = listing.price.negotiable ?? null;
      product.category = listing.category ?? null;
      product.provider = listing.provider ?? sourceEventProvider;
      return product;
    });

    const sessionProduct = this.sessionProductRepository.create({
      session: { eventId },
      sourceEventName,
      sourceEventProvider,
      sourceEventSuccess,
      products: productEntities,
    });

    try {
      await this.sessionProductRepository.save(sessionProduct);
    } catch (error) {
      this.logger.error(`Failed to persist products for session ${eventId}`);
      throw error;
    }

    this.logger.log(
      `Persisted ${String(products.length)} products from ${sourceEventProvider} for session ${eventId}`,
    );
  }
}
