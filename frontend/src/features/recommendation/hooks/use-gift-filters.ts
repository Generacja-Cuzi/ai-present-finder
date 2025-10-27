import { useMemo, useState } from "react";

import type { GiftFilters, PriceRange } from "../types/filters";
import { DEFAULT_FILTERS } from "../types/filters";

export function useGiftFilters() {
  const [filters, setFilters] = useState<GiftFilters>(DEFAULT_FILTERS);

  const updateSearchQuery = (query: string) => {
    setFilters((previous) => ({ ...previous, searchQuery: query }));
  };

  const updateShops = (shops: string[]) => {
    setFilters((previous) => ({ ...previous, shops }));
  };

  const updatePriceRange = (priceRange: PriceRange) => {
    setFilters((previous) => ({ ...previous, priceRange }));
  };

  const updateCategories = (categories: string[]) => {
    setFilters((previous) => ({ ...previous, categories }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.shops.length > 0) count++;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null)
      count++;
    if (filters.categories.length > 0) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateSearchQuery,
    updateShops,
    updatePriceRange,
    updateCategories,
    resetFilters,
    activeFiltersCount,
  };
}
