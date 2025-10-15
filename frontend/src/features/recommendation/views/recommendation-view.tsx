/* eslint-disable no-console */
import type { ListingDto } from "@core/types";
import { useState } from "react";

import {
  BottomNavigation,
  FilterButton,
  GiftCard,
  RecommendationHeader,
  SearchBar,
} from "../components";

interface RecommendationViewProps {
  clientId: string;
  giftIdeas: ListingDto[];
}

export function RecommendationView({ giftIdeas }: RecommendationViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleShopsFilter = () => {
    // TODO: Implement shops filter functionality
    console.log("Shops filter clicked");
  };

  const handlePriceRangeFilter = () => {
    // TODO: Implement price range filter functionality
    console.log("Price range filter clicked");
  };

  const handleCategoryFilter = () => {
    // TODO: Implement category filter functionality
    console.log("Category filter clicked");
  };

  // TODO: Implement actual filtering logic
  const filteredGiftIdeas = giftIdeas;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <RecommendationHeader />

      <main className="flex-1 pb-20">
        <div className="space-y-4 bg-white p-4 pb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className="flex gap-2 overflow-x-auto">
            <FilterButton label="Shops" onClick={handleShopsFilter} />
            <FilterButton
              label="Price Range"
              onClick={handlePriceRangeFilter}
            />
            <FilterButton label="Category" onClick={handleCategoryFilter} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredGiftIdeas.map((gift, index) => (
            <GiftCard
              key={gift.link || index}
              gift={gift}
              provider="Unknown" // TODO: Add provider to ListingDto
            />
          ))}
        </div>

        {filteredGiftIdeas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-gray-900">No gifts found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
