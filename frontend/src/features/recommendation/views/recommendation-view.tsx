import type { ListingWithId } from "@core/types";
import { MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";

import { FilterButton } from "@/components/filter-button";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { GiftCard } from "@/components/ui/gift-card";
import { Navbar } from "@/components/ui/navbar";

import { useGetFeedbackByChatId } from "../api/feedback";
import {
  CategoryFilterDialog,
  ClearFiltersButton,
  FeedbackDialog,
  PriceRangeFilterDialog,
  RecommendationHeader,
  ResultsCount,
  ShopsFilterDialog,
} from "../components";
import { useGiftFilters } from "../hooks/use-gift-filters";
import {
  filterGifts,
  getPriceRange,
  getUniqueCategories,
  getUniqueShops,
} from "../utils/filter-gifts";

export function RecommendationView({
  clientId,
  giftIdeas,
}: {
  clientId: string;
  giftIdeas: ListingWithId[];
}) {
  const {
    filters,
    updateSearchQuery,
    updateShops,
    updatePriceRange,
    updateCategories,
    resetFilters,
    activeFiltersCount,
  } = useGiftFilters();

  const [shopsDialogOpen, setShopsDialogOpen] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  // Check if feedback already exists for this chat
  const {
    data: existingFeedback,
    isLoading: isFeedbackLoading,
    refetch: refetchFeedback,
  } = useGetFeedbackByChatId(clientId);

  const hasFeedback = !isFeedbackLoading && existingFeedback !== undefined;

  const availableShops = useMemo(() => getUniqueShops(giftIdeas), [giftIdeas]);
  const availableCategories = useMemo(
    () => getUniqueCategories(giftIdeas),
    [giftIdeas],
  );
  const availablePriceRange = useMemo(
    () => getPriceRange(giftIdeas),
    [giftIdeas],
  );

  const filteredGiftIdeas = useMemo(
    () => filterGifts(giftIdeas, filters),
    [giftIdeas, filters],
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <RecommendationHeader />

      <main className="flex-1 pb-20">
        <div className="space-y-4 bg-white p-4 pb-6">
          {/* Feedback Button */}
          {!hasFeedback && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFeedbackDialogOpen(true);
                }}
                className="gap-2"
                disabled={isFeedbackLoading}
              >
                <MessageSquare className="h-4 w-4" />
                Leave Feedback
              </Button>
            </div>
          )}

          <SearchBar value={filters.searchQuery} onChange={updateSearchQuery} />

          <div className="flex items-center gap-2 overflow-x-auto">
            <FilterButton
              label="Shops"
              onClick={() => {
                setShopsDialogOpen(true);
              }}
              isActive={filters.shops.length > 0}
              activeCount={filters.shops.length}
            />
            <FilterButton
              label="Price Range"
              onClick={() => {
                setPriceDialogOpen(true);
              }}
              isActive={
                filters.priceRange.min !== null ||
                filters.priceRange.max !== null
              }
            />
            <FilterButton
              label="Category"
              onClick={() => {
                setCategoryDialogOpen(true);
              }}
              isActive={filters.categories.length > 0}
              activeCount={filters.categories.length}
            />
            <ClearFiltersButton
              activeCount={activeFiltersCount}
              onClear={resetFilters}
            />
          </div>
        </div>

        <ResultsCount
          total={giftIdeas.length}
          filtered={filteredGiftIdeas.length}
        />

        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredGiftIdeas.map((gift, index) => (
            <GiftCard
              key={gift.listingId || gift.link || index}
              gift={gift}
              provider={gift.provider ?? "Unknown"}
              listingId={gift.listingId}
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

      <Navbar />

      {/* Filter Dialogs */}
      <ShopsFilterDialog
        open={shopsDialogOpen}
        onOpenChange={setShopsDialogOpen}
        availableShops={availableShops}
        selectedShops={filters.shops}
        onApply={updateShops}
      />

      <PriceRangeFilterDialog
        open={priceDialogOpen}
        onOpenChange={setPriceDialogOpen}
        currentRange={filters.priceRange}
        availableRange={availablePriceRange}
        onApply={updatePriceRange}
      />

      <CategoryFilterDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        availableCategories={availableCategories}
        selectedCategories={filters.categories}
        onApply={updateCategories}
      />

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        chatId={clientId}
        onSuccess={() => {
          void refetchFeedback();
        }}
      />
    </div>
  );
}
