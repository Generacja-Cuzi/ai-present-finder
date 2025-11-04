import type { GiftIdeasOutput } from "../ai/types";

/**
 * Services that are currently disabled and should be filtered out from search queries.
 * Amazon is disabled for now cause Dodi got banned there
 */
export const DISABLED_SERVICES = new Set<"allegro" | "olx" | "ebay" | "amazon">(
  ["amazon"],
);

/**
 * Filters out search queries for disabled services.
 * @param searchQueries - Array of search queries to filter
 * @returns Filtered array of search queries excluding disabled services
 */
export function filterDisabledServices(
  searchQueries: GiftIdeasOutput["search_queries"],
): GiftIdeasOutput["search_queries"] {
  return searchQueries.filter(({ service }) => !DISABLED_SERVICES.has(service));
}
