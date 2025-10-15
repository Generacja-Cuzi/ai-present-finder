import type { ListingDto } from "@core/types";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { AddProductsToSessionCommand } from "../../domain/commands/add-products-to-session.command";

@CommandHandler(AddProductsToSessionCommand)
export class AddProductsToSessionHandler
  implements ICommandHandler<AddProductsToSessionCommand, void>
{
  private readonly logger = new Logger(AddProductsToSessionHandler.name);

  // In-memory storage for products (same as SessionCompletionService)
  private readonly sessionProducts = new Map<string, ListingDto[]>();

  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(command: AddProductsToSessionCommand): Promise<void> {
    const { eventId, products } = command;

    const existingProducts = this.sessionProducts.get(eventId) ?? [];
    existingProducts.push(...products);
    this.sessionProducts.set(eventId, existingProducts);

    this.logger.log(
      `Added ${String(products.length)} products to session ${eventId}, ` +
        `total: ${String(existingProducts.length)}`,
    );
  }

  getSessionProducts(eventId: string): ListingDto[] {
    return this.sessionProducts.get(eventId) ?? [];
  }

  clearSessionProducts(eventId: string): void {
    this.sessionProducts.delete(eventId);
  }
}
