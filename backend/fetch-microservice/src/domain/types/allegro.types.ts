export interface AllegroTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface AllegroPrice {
  amount: string;
  currency: string;
}

export interface AllegroSellingMode {
  price?: AllegroPrice;
}

export interface AllegroImage {
  url: string;
}

export interface AllegroOffer {
  id: string;
  name: string;
  images?: AllegroImage[];
  sellingMode?: AllegroSellingMode;
  description?: string;
}

export interface AllegroSearchResponse {
  items?: {
    promoted?: AllegroOffer[];
    regular?: AllegroOffer[];
  };
}

export interface AllegroConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  searchUrl: string;
  baseOfferUrl: string;
  maxRetries: number;
}

export interface AllegroTokenCache {
  token: string;
  expiresAt: number;
}

export interface AllegroSearchOptions {
  offset?: number;
  limit?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
}
