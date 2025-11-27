import { Star } from "lucide-react";
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
  const createFeedback = useCreateFeedback();

  const maxWords = isGeneralFeedback ? 300 : 100;
  const wordCount =
    comment.trim() === "" ? 0 : comment.trim().split(/\s+/).length;
  const isWordLimitExceeded = wordCount > maxWords;

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
      const feedbackData = {
        chatId,
        rating,
        comment: trimmedComment === "" ? null : trimmedComment,
        productId: productId ?? null,
        isGeneralFeedback,
      };

      await createFeedback.mutateAsync({
        body: feedbackData,
      });

      toast.success("Dziękujemy za opinię!", {
        description: "Twoja opinia została pomyślnie przesłana",
      });

      // Reset form
      setRating(0);
      setComment("");
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
