import type { ListingWithId } from "@core/types";

import type { GiftFilters } from "../types/filters";

export function filterGifts(
  gifts: ListingWithId[],
  filters: GiftFilters,
): ListingWithId[] {
  return gifts.filter((gift) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = gift.title.toLowerCase().includes(query);
      const matchesDescription = gift.description.toLowerCase().includes(query);
      const matchesCategory =
        gift.category?.toLowerCase().includes(query) ?? false;

      if (!matchesTitle && !matchesDescription && !matchesCategory) {
        return false;
      }
    }
    if (
      filters.shops.length > 0 &&
      (gift.provider === undefined || !filters.shops.includes(gift.provider))
    ) {
      return false;
    }

    if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
      const price = gift.price.value;

      if (price === null) {
        return false;
      }

      if (filters.priceRange.min !== null && price < filters.priceRange.min) {
        return false;
      }

      if (filters.priceRange.max !== null && price > filters.priceRange.max) {
        return false;
      }
    }

    if (
      filters.categories.length > 0 &&
      (gift.category === null ||
        gift.category === undefined ||
        gift.category.trim() === "" ||
        !filters.categories.includes(gift.category))
    ) {
      return false;
    }

    return true;
  });
}

export function extractDomain(url: string): string {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function getUniqueShops(gifts: ListingWithId[]): string[] {
  const shops = gifts
    .map((gift) => gift.provider)
    .filter((provider): provider is string => provider !== undefined);
  const uniqueShops = [...new Set(shops)];
  uniqueShops.sort((a, b) => a.localeCompare(b));
  return uniqueShops;
}

export function getUniqueCategories(gifts: ListingWithId[]): string[] {
  const categories = gifts
    .map((gift) => gift.category)
    .filter((category): category is string => {
      return (
        category !== null && category !== undefined && category.trim() !== ""
      );
    });

  const uniqueCategories = [...new Set(categories)];
  uniqueCategories.sort((a, b) => a.localeCompare(b));
  return uniqueCategories;
}

export function getPriceRange(gifts: ListingWithId[]): {
  min: number;
  max: number;
} {
  const prices = gifts
    .map((gift) => gift.price.value)
    .filter((price): price is number => price !== null);

  if (prices.length === 0) {
    return { min: 0, max: 1000 };
  }

  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}
