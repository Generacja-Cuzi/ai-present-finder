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
      return product;
    });

    const sessionProduct = this.sessionProductRepository.create({
      session: { eventId } as GiftSession,
      sourceEventName,
      sourceEventProvider,
      sourceEventSuccess,
      products: productEntities,
    });

    await this.sessionProductRepository.save(sessionProduct);

    this.logger.log(
      `Persisted ${String(products.length)} products from ${sourceEventProvider} for session ${eventId}`,
    );
  }
}
