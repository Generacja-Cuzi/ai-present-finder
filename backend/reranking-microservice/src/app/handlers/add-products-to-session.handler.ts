import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { AddProductsToSessionCommand } from "../../domain/commands/add-products-to-session.command";
import { GiftSessionProduct } from "../../domain/entities/gift-session-product.entity";
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

    const records = products.map((listing) => {
      const productEntity = Object.assign(new Product(), {
        image: listing.image,
        title: listing.title,
        description: listing.description,
        link: listing.link,
        priceValue: listing.price.value ?? null,
        priceLabel: listing.price.label ?? null,
        priceCurrency: listing.price.currency ?? null,
        priceNegotiable: listing.price.negotiable ?? null,
      });

      return this.sessionProductRepository.create({
        session: { eventId },
        sourceEventName,
        sourceEventProvider,
        sourceEventSuccess,
        product: productEntity,
      });
    });

    await this.sessionProductRepository.save(records);

    this.logger.log(
      `Persisted ${String(products.length)} products from ${sourceEventProvider} for session ${eventId}`,
    );
  }
}
