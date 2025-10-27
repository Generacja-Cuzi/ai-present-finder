import type { ListingWithId } from "@core/types";
import { describe, expect, it } from "vitest";

import type { GiftFilters } from "../types/filters";
import {
  extractDomain,
  filterGifts,
  getPriceRange,
  getUniqueCategories,
  getUniqueShops,
} from "./filter-gifts";

const mockGifts: ListingWithId[] = [
  {
    listingId: "1",
    title: "Gaming Mouse",
    description: "High-performance gaming mouse",
    image: null,
    link: "https://www.amazon.com/product1",
    price: { value: 50, label: "$50", currency: "USD", negotiable: false },
    category: "Electronics",
    provider: "amazon",
  },
  {
    listingId: "2",
    title: "Coffee Maker",
    description: "Automatic coffee maker",
    image: null,
    link: "https://www.ebay.com/product2",
    price: { value: 100, label: "$100", currency: "USD", negotiable: false },
    category: "Home & Kitchen",
    provider: "ebay",
  },
  {
    listingId: "3",
    title: "Wireless Keyboard",
    description: "Bluetooth wireless keyboard",
    image: null,
    link: "https://www.amazon.com/product3",
    price: { value: 75, label: "$75", currency: "USD", negotiable: false },
    category: "Electronics",
    provider: "amazon",
  },
  {
    listingId: "4",
    title: "Book",
    description: "Best seller book",
    image: null,
    link: "https://www.bookstore.com/product4",
    price: { value: null, label: null, currency: null, negotiable: null },
    category: "Books",
    provider: "bookstore",
  },
];

describe("filterGifts", () => {
  it("should return all gifts when no filters are applied", () => {
    const filters: GiftFilters = {
      searchQuery: "",
      shops: [],
      priceRange: { min: null, max: null },
      categories: [],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(4);
  });

  it("should filter by search query in title", () => {
    const filters: GiftFilters = {
      searchQuery: "gaming",
      shops: [],
      priceRange: { min: null, max: null },
      categories: [],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Gaming Mouse");
  });

  it("should filter by search query in description", () => {
    const filters: GiftFilters = {
      searchQuery: "automatic",
      shops: [],
      priceRange: { min: null, max: null },
      categories: [],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Coffee Maker");
  });

  it("should filter by shop", () => {
    const filters: GiftFilters = {
      searchQuery: "",
      shops: ["amazon"],
      priceRange: { min: null, max: null },
      categories: [],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(2);
    expect(result.every((gift) => gift.provider === "amazon")).toBe(true);
  });

  it("should filter by multiple shops", () => {
    const filters: GiftFilters = {
      searchQuery: "",
      shops: ["amazon", "ebay"],
      priceRange: { min: null, max: null },
      categories: [],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(3);
  });

  it("should filter by minimum price", () => {
    const filters: GiftFilters = {
      searchQuery: "",
      shops: [],
      priceRange: { min: 75, max: null },
      categories: [],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(2);
    expect(result.every((gift) => (gift.price.value ?? 0) >= 75)).toBe(true);
  });

  it("should filter by maximum price", () => {
    const filters: GiftFilters = {
      searchQuery: "",
      shops: [],
      priceRange: { min: null, max: 75 },
      categories: [],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(2);
    expect(result.every((gift) => (gift.price.value ?? 0) <= 75)).toBe(true);
  });

  it("should filter by price range", () => {
    const filters: GiftFilters = {
      searchQuery: "",
      shops: [],
      priceRange: { min: 50, max: 75 },
      categories: [],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(2);
  });

  it("should filter by category", () => {
    const filters: GiftFilters = {
      searchQuery: "",
      shops: [],
      priceRange: { min: null, max: null },
      categories: ["Electronics"],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(2);
    expect(result.every((gift) => gift.category === "Electronics")).toBe(true);
  });

  it("should filter by multiple categories", () => {
    const filters: GiftFilters = {
      searchQuery: "",
      shops: [],
      priceRange: { min: null, max: null },
      categories: ["Electronics", "Books"],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(3);
  });

  it("should apply multiple filters together", () => {
    const filters: GiftFilters = {
      searchQuery: "wireless",
      shops: ["amazon"],
      priceRange: { min: 50, max: 100 },
      categories: ["Electronics"],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Wireless Keyboard");
  });

  it("should exclude gifts with null prices when price filter is applied", () => {
    const filters: GiftFilters = {
      searchQuery: "",
      shops: [],
      priceRange: { min: 0, max: null },
      categories: [],
    };

    const result = filterGifts(mockGifts, filters);
    expect(result).toHaveLength(3);
    expect(result.every((gift) => gift.price.value !== null)).toBe(true);
  });
});

describe("extractDomain", () => {
  it("should extract domain from URL", () => {
    expect(extractDomain("https://www.amazon.com/product")).toBe("amazon.com");
    expect(extractDomain("https://ebay.com/item")).toBe("ebay.com");
  });

  it("should handle invalid URLs", () => {
    expect(extractDomain("not-a-url")).toBe("");
  });
});

describe("getUniqueShops", () => {
  it("should return unique shop providers", () => {
    const shops = getUniqueShops(mockGifts);
    expect(shops).toEqual(["amazon", "bookstore", "ebay"]);
  });

  it("should return empty array for empty input", () => {
    const shops = getUniqueShops([]);
    expect(shops).toEqual([]);
  });
});

describe("getUniqueCategories", () => {
  it("should return unique categories", () => {
    const categories = getUniqueCategories(mockGifts);
    expect(categories).toEqual(["Books", "Electronics", "Home & Kitchen"]);
  });

  it("should filter out null categories", () => {
    const giftsWithNull: ListingWithId[] = [
      ...mockGifts,
      {
        listingId: "5",
        title: "Unknown",
        description: "No category",
        image: null,
        link: "https://example.com",
        price: { value: 10, label: "$10", currency: "USD", negotiable: false },
        category: null,
        provider: "example",
      },
    ];

    const categories = getUniqueCategories(giftsWithNull);
    expect(categories).toEqual(["Books", "Electronics", "Home & Kitchen"]);
  });

  it("should return empty array for empty input", () => {
    const categories = getUniqueCategories([]);
    expect(categories).toEqual([]);
  });
});

describe("getPriceRange", () => {
  it("should return min and max prices", () => {
    const range = getPriceRange(mockGifts);
    expect(range).toEqual({ min: 50, max: 100 });
  });

  it("should ignore null prices", () => {
    const range = getPriceRange(mockGifts);
    expect(range.min).toBeGreaterThan(0);
  });

  it("should return default range for empty input", () => {
    const range = getPriceRange([]);
    expect(range).toEqual({ min: 0, max: 1000 });
  });

  it("should return default range when all prices are null", () => {
    const giftsWithNullPrices: ListingWithId[] = [
      {
        listingId: "1",
        title: "Item",
        description: "Description",
        image: null,
        link: "https://example.com",
        price: { value: null, label: null, currency: null, negotiable: null },
        category: null,
        provider: "example",
      },
    ];

    const range = getPriceRange(giftsWithNullPrices);
    expect(range).toEqual({ min: 0, max: 1000 });
  });
});
