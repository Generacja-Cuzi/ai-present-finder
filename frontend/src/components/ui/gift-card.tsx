import type { ListingPayload, ListingWithId } from "@core/types";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from "../../features/saved/api/favorites.api";

export function GiftCard({
  gift,
  provider,
  listingId,
  initialIsFavorited = false,
  chatId,
}: {
  gift: ListingPayload | ListingWithId;
  provider: string;
  listingId?: string;
  initialIsFavorited?: boolean;
  chatId: string;
}) {
  const [imageError, setImageError] = useState(false);
  const queryClient = useQueryClient();
  const addToFavorites = useAddToFavoritesMutation();
  const removeFromFavorites = useRemoveFromFavoritesMutation();

  const [isBookmarked, setIsBookmarked] = useState(initialIsFavorited);

  const handleBookmark = async () => {
    if (listingId === undefined || listingId === "") {
      toast.error("Nie można dodać tego przedmiotu do ulubionych");
      return;
    }

    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);

    try {
      if (newBookmarkState) {
        await addToFavorites.mutateAsync({
          body: { listingId },
        });
        toast.success("Dodano do ulubionych");
      } else {
        await removeFromFavorites.mutateAsync({
          params: { path: { listingId } },
        });
        toast.success("Usunięto z ulubionych");
      }

      await queryClient.invalidateQueries({
        queryKey: ["get", "/favorites"],
      });

      if (chatId) {
        await queryClient.invalidateQueries({
          queryKey: ["get", `/chats/${chatId}/listings`],
        });
      }
    } catch (error) {
      setIsBookmarked(!newBookmarkState);
      toast.error(
        newBookmarkState
          ? "Nie udało się dodać do ulubionych"
          : "Nie udało się usunąć z ulubionych",
      );
      console.error("Bookmark error:", error);
    }
  };

  const hasImage = gift.image !== null && gift.image.length > 0 && !imageError;

  return (
    <Card className="relative flex h-full max-h-[480px] max-w-[280px] flex-col overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-3">
        <div className="rounded-full bg-gray-800/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          {provider}
        </div>

        <Button
          onClick={handleBookmark}
          variant="ghost"
          size="icon"
          className="relative z-20 h-8 w-8 flex-shrink-0 rounded-full bg-gray-800/80 p-0 backdrop-blur-sm transition-colors hover:bg-gray-700/80"
          aria-label={
            isBookmarked ? "Usuń z ulubionych" : "Dodaj do ulubionych"
          }
        >
          <Bookmark
            className={`h-4 w-4 ${isBookmarked ? "fill-white text-white" : "text-white"}`}
          />
        </Button>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {hasImage && gift.image !== null && gift.image.length > 0 ? (
          <img
            src={gift.image}
            alt={gift.title}
            className="h-full w-full object-cover"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 px-4 pt-4">
          <p className="text-xl font-semibold text-gray-900">
            {gift.price.value === null
              ? "Cena niedostępna"
              : `${gift.price.value} ${gift.price.currency ?? "zł"}`}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-gray-700">
            {gift.title}
          </h3>
        </div>

        <div className="px-4 pb-4 pt-3">
          <Button
            asChild
            className="bg-primary hover:bg-primary h-11 w-full rounded-xl text-base font-semibold"
          >
            <a href={gift.link} target="_blank" rel="noopener noreferrer">
              Kup teraz
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
