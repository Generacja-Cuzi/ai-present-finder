export interface AmazonProduct {
  product_title?: string;
  product_price?: string;
  product_original_price?: string;
  currency?: string;
  product_url?: string;
  product_photo?: string;
  product_num_ratings?: number;
  product_star_rating?: string;
  product_availability?: string;
}

export interface AmazonApiResponse {
  status: string;
  request_id?: string;
  data?: {
    products?: AmazonProduct[];
  };
}

export interface AmazonConfig {
  rapidApiKey: string;
  apiUrl: string;
  apiHost: string;
  defaultCountry: string;
  maxRetries: number;
}

export interface AmazonSearchParameters {
  query: string;
  country: string;
  page: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}
