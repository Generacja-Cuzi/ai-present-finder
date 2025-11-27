import { ImagePlus, Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCreateFeedback } from "../api/feedback";

export function FeedbackDialog({
  open,
  onOpenChange,
  chatId,
  productId,
  isGeneralFeedback = false,
  productTitle,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  productId?: string | null;
  isGeneralFeedback?: boolean;
  productTitle?: string;
  onSuccess?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const createFeedback = useCreateFeedback();

  const maxWords = isGeneralFeedback ? 300 : 100;
  const maxImages = 5;
  const maxImageSize = 5 * 1024 * 1024; // 5MB
  const wordCount =
    comment.trim() === "" ? 0 : comment.trim().split(/\s+/).length;
  const isWordLimitExceeded = wordCount > maxWords;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];

    if (images.length + files.length > maxImages) {
      toast.error(`Możesz dodać maksymalnie ${String(maxImages)} zdjęć`);
      return;
    }

    const invalidFiles = new Set<File>();
    for (const file of files) {
      if (file.size > maxImageSize) {
        toast.error(`Plik ${file.name} jest za duży (max 5MB)`);
        invalidFiles.add(file);
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`Plik ${file.name} nie jest obrazem`);
        invalidFiles.add(file);
      }
    }

    const validFiles = files.filter((file) => !invalidFiles.has(file));
    setImages([...images, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, index_) => index_ !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Proszę wybrać ocenę przed wysłaniem");
      return;
    }

    if (isWordLimitExceeded) {
      toast.error(`Opinia może mieć maksymalnie ${String(maxWords)} słów`);
      return;
    }

    try {
      const trimmedComment = comment.trim();
      const formData = new FormData();
      formData.append("chatId", chatId);
      formData.append("rating", rating.toString());
      formData.append("comment", trimmedComment === "" ? "" : trimmedComment);
      formData.append("productId", productId ?? "");
      formData.append("isGeneralFeedback", isGeneralFeedback.toString());

      for (const image of images) {
        formData.append("images", image);
      }

      await createFeedback.mutateAsync({
        body: formData as never,
      });

      toast.success("Dziękujemy za opinię!", {
        description: "Twoja opinia została pomyślnie przesłana",
      });

      // Reset form
      setRating(0);
      setComment("");
      setImages([]);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Nie udało się wysłać opinii. Spróbuj ponownie.");
    }
  };

  const getDialogTitle = () => {
    if (isGeneralFeedback) {
      return "Ogólna opinia o wyszukiwaniu";
    }
    if (productTitle != null && productTitle.trim().length > 0) {
      return `Oceń: ${productTitle}`;
    }
    return "Podziel się opinią";
  };

  const getDialogDescription = () => {
    if (isGeneralFeedback) {
      return "Oceń ogólną jakość wyników wyszukiwania";
    }
    return "Pomóż nam się poprawić, oceniając ten produkt";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rating">Ocena *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                  }}
                  onMouseEnter={() => {
                    setHoveredRating(star);
                  }}
                  onMouseLeave={() => {
                    setHoveredRating(0);
                  }}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-500">
                {rating === 1 && "Słabo"}
                {rating === 2 && "W porządku"}
                {rating === 3 && "Dobrze"}
                {rating === 4 && "Bardzo dobrze"}
                {rating === 5 && "Doskonale"}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">
              Komentarz (opcjonalnie, max {maxWords} słów)
            </Label>
            <Textarea
              id="comment"
              placeholder="Opowiedz nam więcej o swoim doświadczeniu..."
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
              }}
              rows={4}
              className={`resize-none ${isWordLimitExceeded ? "border-red-500" : ""}`}
            />
            <div className="flex justify-between text-xs">
              <span
                className={
                  isWordLimitExceeded ? "text-red-500" : "text-gray-500"
                }
              >
                {wordCount} / {maxWords} słów
              </span>
              {isWordLimitExceeded ? (
                <span className="text-red-500">Przekroczono limit!</span>
              ) : null}
            </div>
          </div>
          {isGeneralFeedback ? (
            <div className="grid gap-2">
              <Label htmlFor="images">
                Zdjęcia (opcjonalnie, max {maxImages})
              </Label>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {images.map((image, index) => (
                    <div
                      key={`${image.name}-${String(index)}`}
                      className="relative h-20 w-20 overflow-hidden rounded-lg border"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${String(index + 1)}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          removeImage(index);
                        }}
                        className="absolute right-0 top-0 rounded-bl-lg bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < maxImages ? (
                    <label
                      htmlFor="image-upload"
                      className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                    >
                      <ImagePlus className="h-6 w-6 text-gray-400" />
                      <span className="mt-1 text-xs text-gray-500">Dodaj</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500">
                  {images.length} / {maxImages} zdjęć (max 5MB każde)
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={createFeedback.isPending}
          >
            Anuluj
          </Button>
          <Button
            onClick={() => {
              void handleSubmit();
            }}
            disabled={
              createFeedback.isPending || rating === 0 || isWordLimitExceeded
            }
          >
            {createFeedback.isPending ? "Wysyłanie..." : "Wyślij opinię"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
