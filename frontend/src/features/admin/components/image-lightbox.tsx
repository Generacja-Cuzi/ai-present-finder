import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { getBackendUrl } from "@/lib/backend-url";

async function fetchImageBlob(imageId: string) {
  const response = await fetch(`${getBackendUrl()}/feedback/images/${imageId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function ImageLightbox({
  imageId,
  onClose,
}: {
  imageId: string;
  onClose: () => void;
}) {
  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["feedback-image-lightbox", imageId],
    queryFn: async () => fetchImageBlob(imageId),
    enabled: imageId.length > 0,
    staleTime: Infinity,
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (isLoading || imageUrl === undefined) {
    return (
      <div
        role="button"
        tabIndex={0}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
        onKeyDown={(event_) => {
          if (event_.key === "Enter" || event_.key === " ") {
            onClose();
          }
        }}
      >
        <div className="text-white">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      onKeyDown={(event_) => {
        if (event_.key === "Enter" || event_.key === " ") {
          onClose();
        }
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      <button
        type="button"
        className="max-h-[90vh] max-w-[90vw]"
        onClick={(event_) => {
          event_.stopPropagation();
        }}
      >
        <img
          src={imageUrl}
          alt="Powiększone zdjęcie"
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        />
      </button>
    </div>
  );
}
