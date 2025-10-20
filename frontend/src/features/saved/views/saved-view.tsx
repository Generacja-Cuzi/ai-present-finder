import { GiftCard } from "@/components/ui/gift-card";
import { Navbar } from "@/components/ui/navbar";
import { useGetFavoritesQuery } from "@/lib/favorites/favorites.api";

import { SavedHeader } from "../components";

export function SavedView() {
  const { data, isLoading, error } = useGetFavoritesQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <SavedHeader />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Loading your saved gifts...</p>
        </div>
        <Navbar />
      </div>
    );
  }

  if (data === undefined) {
    const hasError = Boolean(error);
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <SavedHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              {hasError ? "Failed to load saved gifts" : "No data available"}
            </p>
            {hasError ? (
              <p className="mt-1 text-sm text-gray-500">
                Please try again later
              </p>
            ) : null}
          </div>
        </div>
        <Navbar />
      </div>
    );
  }

  const favorites = data.favorites;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SavedHeader />

      <main className="flex-1 pb-20">
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {favorites.map((listing) => (
            <GiftCard
              key={listing.id}
              gift={{
                image: listing.image,
                title: listing.title,
                description: listing.description,
                link: listing.link,
                price: {
                  value: listing.priceValue,
                  label: listing.priceLabel,
                  currency: listing.priceCurrency,
                  negotiable: listing.priceNegotiable,
                },
              }}
              provider="Saved"
              listingId={listing.id}
              initialIsFavorited={true}
            />
          ))}
        </div>

        {favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-gray-900">
              No saved gifts yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Start browsing to find the perfect present!
            </p>
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}
