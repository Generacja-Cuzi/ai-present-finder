import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { GiftSessionProduct } from "../../domain/entities/gift-session-product.entity";
import { GiftSession } from "../../domain/entities/gift-session.entity";
import {
  GetSessionProductsQuery,
  SessionProductsResult,
} from "../../domain/queries/get-session-products.query";

@QueryHandler(GetSessionProductsQuery)
export class GetSessionProductsHandler
  implements
    IQueryHandler<GetSessionProductsQuery, SessionProductsResult | null>
{
  private readonly logger = new Logger(GetSessionProductsHandler.name);

  constructor(
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
    @InjectRepository(GiftSessionProduct)
    private readonly giftSessionProductRepository: Repository<GiftSessionProduct>,
  ) {}

  async execute(
    query: GetSessionProductsQuery,
  ): Promise<SessionProductsResult | null> {
    const { eventId } = query;

    const session = await this.giftSessionRepository.findOne({
      where: { eventId },
    });

    if (session === null) {
      this.logger.error(`Session ${eventId} not found in database`);
      return null;
    }

    const productGroups = await this.giftSessionProductRepository.find({
      where: { session: { eventId } },
      relations: ["products"],
      order: { createdAt: "ASC" },
    });

    const allProducts = productGroups.flatMap((group) => group.products);

    return { session, allProducts };
  }
}
