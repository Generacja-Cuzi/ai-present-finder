import type { ListingWithId } from "@core/types";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FilterButton } from "@/components/filter-button";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { GiftCard } from "@/components/ui/gift-card";
import { Navbar } from "@/components/ui/navbar";

import { useGetFeedbackByChatId } from "../api/feedback";
import { useStartChatRefinement } from "../api/start-refinement";
import {
  CategoryFilterDialog,
  ClearFiltersButton,
  FeedbackDialog,
  PriceRangeFilterDialog,
  RecommendationHeader,
  RefineSearchDialog,
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
  const [refineDialogOpen, setRefineDialogOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedGifts, setSelectedGifts] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const startRefinement = useStartChatRefinement();

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

  const handleToggleSelection = (listingId: string) => {
    setSelectedGifts((previous) => {
      const newSet = new Set(previous);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  const handleStartRefinement = async () => {
    if (selectedGifts.size === 0) {
      toast.error("Wybierz przynajmniej jeden prezent");
      return;
    }

    try {
      await startRefinement.mutateAsync({
        params: { path: { chatId: clientId } },
        body: { selectedListingIds: [...selectedGifts] },
      });

      toast.success("Rozpoczynamy doprecyzowanie!");
      setRefineDialogOpen(false);

      // Navigate back to chat
      await navigate({
        to: "/chat/$id",
        params: { id: clientId },
      });
    } catch (error) {
      toast.error("Nie udało się rozpocząć doprecyzowania");
      console.error("Refinement error:", error);
    }
  };

  const handleEnterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedGifts(new Set());
  };

  const handleExitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedGifts(new Set());
  };

  const handleConfirmSelection = () => {
    if (selectedGifts.size === 0) {
      toast.error("Wybierz przynajmniej jeden prezent");
      return;
    }
    setRefineDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <RecommendationHeader />

      <main className="flex-1 pb-20">
        <div className="space-y-4 bg-white p-4 pb-6">
          <div className="flex items-center justify-between gap-2">
            {selectionMode ? (
              <>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExitSelectionMode}
                  >
                    Anuluj
                  </Button>
                  <span className="text-sm text-gray-600">
                    Wybrano: {selectedGifts.size}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={handleConfirmSelection}
                  disabled={selectedGifts.size === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Doprecyzuj ({selectedGifts.size})
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnterSelectionMode}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Wybierz prezenty
                </Button>
                {!hasFeedback && (
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
                    Oceń wyniki
                  </Button>
                )}
              </>
            )}
          </div>

          <SearchBar value={filters.searchQuery} onChange={updateSearchQuery} />

          <div className="flex items-center gap-2 overflow-x-auto">
            <FilterButton
              label="Sklepy"
              onClick={() => {
                setShopsDialogOpen(true);
              }}
              isActive={filters.shops.length > 0}
              activeCount={filters.shops.length}
            />
            <FilterButton
              label="Zakres cen"
              onClick={() => {
                setPriceDialogOpen(true);
              }}
              isActive={
                filters.priceRange.min !== null ||
                filters.priceRange.max !== null
              }
            />
            <FilterButton
              label="Kategoria"
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
          {filteredGiftIdeas.map((gift, index) => {
            const listingId = gift.listingId || "";
            const isSelected = selectedGifts.has(listingId);

            return (
              <div
                key={gift.listingId || gift.link || index}
                className="relative"
                onClick={() => {
                  if (selectionMode && listingId) {
                    handleToggleSelection(listingId);
                  }
                }}
              >
                {selectionMode && listingId && (
                  <div
                    className={`absolute inset-0 z-20 rounded-2xl border-4 transition-all ${
                      isSelected
                        ? "border-purple-600 bg-purple-600/10"
                        : "border-transparent hover:border-purple-300"
                    }`}
                  >
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                  </div>
                )}
                <GiftCard
                  gift={gift}
                  provider={gift.provider ?? "Nieznany"}
                  listingId={listingId}
                  initialIsFavorited={Boolean(gift.isFavorited) || false}
                  chatId={clientId}
                  selectionMode={selectionMode}
                />
              </div>
            );
          })}
        </div>

        {filteredGiftIdeas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-gray-900">
              Nie znaleziono prezentów
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Spróbuj dostosować wyszukiwanie lub filtry
            </p>
          </div>
        )}
      </main>

      <Navbar />

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

      <FeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        chatId={clientId}
        onSuccess={() => {
          void refetchFeedback();
        }}
      />

      <RefineSearchDialog
        open={refineDialogOpen}
        onOpenChange={setRefineDialogOpen}
        selectedCount={selectedGifts.size}
        onConfirm={handleStartRefinement}
        isLoading={startRefinement.isPending}
      />
    </div>
  );
}
