import { useQuery } from "@tanstack/react-query";

import { getBackendUrl } from "@/lib/backend-url";

async function fetchImageBlob(imageId: string) {
  const response = await fetch(`${getBackendUrl()}/feedback/images/${imageId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function FeedbackImage({
  imageId,
  onClick,
}: {
  imageId: string;
  onClick: () => void;
}) {
  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["feedback-image", imageId],
    queryFn: async () => fetchImageBlob(imageId),
    enabled: imageId.length > 0,
    staleTime: Infinity, // Image won't change
  });

  if (isLoading) {
    return (
      <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-lg border-2 border-orange-300 bg-orange-100">
        <span className="text-xs text-orange-600">Ładowanie...</span>
      </div>
    );
  }

  if (imageUrl === undefined) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-24 w-24 overflow-hidden rounded-lg border-2 border-orange-300 transition-all hover:scale-105 hover:border-orange-500 hover:shadow-lg"
    >
      <img
        src={imageUrl}
        alt="Zdjęcie z opinii"
        className="h-full w-full object-cover transition-transform group-hover:scale-110"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
        <span className="text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          Kliknij aby powiększyć
        </span>
      </div>
    </button>
  );
}
