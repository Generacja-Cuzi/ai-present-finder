export interface PriceRange {
  min: number | null;
  max: number | null;
}

export interface GiftFilters {
  searchQuery: string;
  shops: string[];
  priceRange: PriceRange;
  categories: string[];
  rounds: number[];
}

export const DEFAULT_FILTERS: GiftFilters = {
  searchQuery: "",
  shops: [],
  priceRange: { min: null, max: null },
  categories: [],
  rounds: [],
};
