import type { ListingDto } from "@core/types";
import { Bookmark, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function GiftCard({
  gift,
  provider,
}: {
  gift: ListingDto;
  provider: string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleBookmark = () => {
    // TODO: Implement bookmark functionality
    setIsBookmarked(!isBookmarked);
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
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm transition-colors hover:bg-gray-700/80"
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <Bookmark
            className={`h-4 w-4 ${isBookmarked ? "fill-white text-white" : "text-white"}`}
          />
        </Button>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {hasImage && gift.image !== null ? (
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
              ? "Price not available"
              : `${gift.price.value.toFixed(2)} ${gift.price.currency ?? "zł"}`}
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
              Buy Now
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
