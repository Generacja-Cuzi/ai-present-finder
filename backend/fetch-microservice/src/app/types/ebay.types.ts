// eBay Browse API Types and Configuration

export interface EbayTokenResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

export interface EbayItemPrice {
  value?: string | null;
  currency?: string | null;
}

export interface EbayItemImage {
  imageUrl?: string | null;
}

export interface EbayItemSummary {
  title?: string | null;
  shortDescription?: string | null;
  itemWebUrl?: string | null;
  itemHref?: string | null;
  image?: EbayItemImage | null;
  thumbnailImages?: (EbayItemImage | null)[] | null;
  price?: EbayItemPrice | null;
}

export interface EbaySearchResponse {
  itemSummaries?: (EbayItemSummary | null)[] | null;
  total?: number;
  limit?: number;
  offset?: number;
  href?: string;
  next?: string;
  prev?: string;
}

export interface EbayErrorResponse {
  errors?: {
    errorId?: number;
    domain?: string;
    category?: string;
    message?: string;
    longMessage?: string;
    parameters?: {
      name?: string;
      value?: string;
    }[];
  }[];
}

export interface EbayCachedToken {
  token: string;
  expiresAt: number;
}

export interface EbayConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  searchUrl: string;
  oauthScope: string;
  marketplaceId: string;
  maxRetries: number;
  tokenBufferSeconds: number;
}

export interface EbaySearchParameters {
  q: string;
  limit: string;
  offset: string;
  filter?: string;
  sort?: string;
  aspect_filter?: string;
  category_ids?: string;
  fieldgroups?: string;
  [key: string]: string | undefined;
}

export interface EbayRequestHeaders {
  Authorization: string;
  "Content-Type": string;
  "X-EBAY-C-MARKETPLACE-ID": string;
  [key: string]: string;
}

export interface EbayTokenRequestHeaders {
  "Content-Type": string;
  Authorization: string;
  [key: string]: string;
}
