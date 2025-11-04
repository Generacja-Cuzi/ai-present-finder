import type { RegenerateIdeasLoopEvent } from "@core/events";
import type { RecipientProfile } from "@core/types";

import { Command } from "@nestjs/cqrs";

import type { GiftSession } from "../entities/gift-session.entity";
import type { Product } from "../entities/product.entity";

export interface RegenerateIdeasLoopResult {
  shouldRegenerate: boolean;
  event: RegenerateIdeasLoopEvent | null;
  newLoopCount: number;
}

export class CheckAndPrepareRegenerateIdeasLoopCommand extends Command<RegenerateIdeasLoopResult> {
  constructor(
    public readonly eventId: string,
    public readonly session: GiftSession,
    public readonly updatedProducts: Product[],
    public readonly goodProductsCount: number,
    public readonly topBestCount: number,
    public readonly minimalScore: number,
    public readonly maxIdeasLoop: number,
    public readonly chatId: string,
    public readonly recipientProfile: RecipientProfile | null,
    public readonly keywords: string[],
  ) {
    super();
  }
}
