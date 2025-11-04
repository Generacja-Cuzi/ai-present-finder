import type { RecipientProfile } from "@core/types";

export interface BadProductInfo {
  title: string;
  description: string;
  link: string;
  provider: string;
  score: number;
  reasoning: string | null;
}

export interface ProviderCount {
  provider: string;
  count: number;
}

export class RegenerateIdeasLoopEvent {
  constructor(
    public readonly chatId: string,
    public readonly eventId: string,
    public readonly userProfile: RecipientProfile | null,
    public readonly keywords: string[],
    public readonly badProducts: BadProductInfo[],
    public readonly providerCounts: ProviderCount[],
    public readonly saveProfile?: boolean,
    public readonly profileName?: string | null,
  ) {}
}
