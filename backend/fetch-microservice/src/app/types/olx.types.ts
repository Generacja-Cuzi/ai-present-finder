export interface OlxPriceParameter {
  __typename?: "PriceParam";
  value?: number | null;
  label?: string | null;
  currency?: string | null;
  negotiable?: boolean | null;
  [key: string]: unknown;
}

export interface OlxListingParameter {
  key?: string | null;
  value?: OlxPriceParameter | Record<string, unknown> | null;
}

export interface OlxPhoto {
  link?: string | null;
}

export interface OlxListingItem {
  title?: string | null;
  url?: string | null;
  description?: string | null;
  photos?: (OlxPhoto | null)[] | null;
  params?: (OlxListingParameter | null | undefined)[] | null;
}

export interface OlxListingSuccess {
  __typename: "ListingSuccess";
  data?: (OlxListingItem | null | undefined)[] | null;
}

export interface OlxListingError {
  __typename: "ListingError";
  error?: {
    code?: string | null;
    title?: string | null;
    status?: string | number | null;
    detail?: string | null;
  } | null;
}

export type OlxListingPayload =
  | OlxListingSuccess
  | OlxListingError
  | null
  | undefined;

export interface OlxGraphQLError {
  message?: string;
  locations?: {
    line?: number;
    column?: number;
  }[];
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
}

export interface OlxGraphQLResponse {
  data?: {
    clientCompatibleListings?: OlxListingPayload;
  };
  clientCompatibleListings?: OlxListingPayload;
  errors?: OlxGraphQLError[];
}

export interface OlxSearchParameter {
  key: string;
  value: string;
}

export interface OlxGraphQLQuery {
  query: string;
  variables: {
    searchParameters: OlxSearchParameter[];
  };
}

export interface OlxConfig {
  apiUrl: string;
  maxRetries: number;
}

export interface OlxRequestHeaders {
  "content-type": string;
  accept: string;
  origin: string;
  referer: string;
  "x-client": string;
  "user-agent": string;
  [key: string]: string;
}
