import type { ListingDto } from "@core/types";

export class AddProductsToSessionCommand {
  constructor(
    public readonly eventId: string,
    public readonly products: ListingDto[],
  ) {}
}
