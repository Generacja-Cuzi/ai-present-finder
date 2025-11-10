import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import type { PriceRange } from "../types/filters";

export function PriceRangeFilterDialog({
  open,
  onOpenChange,
  currentRange,
  availableRange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRange: PriceRange;
  availableRange: { min: number; max: number };
  onApply: (range: PriceRange) => void;
}) {
  const [temporaryRange, setTemporaryRange] =
    useState<PriceRange>(currentRange);

  const handleSliderChange = (values: number[]) => {
    setTemporaryRange({
      min: values[0] ?? availableRange.min,
      max: values[1] ?? availableRange.max,
    });
  };

  const handleMinChange = (value: string) => {
    const numberValue = value === "" ? null : Number.parseFloat(value);
    setTemporaryRange((previous) => ({ ...previous, min: numberValue }));
  };

  const handleMaxChange = (value: string) => {
    const numberValue = value === "" ? null : Number.parseFloat(value);
    setTemporaryRange((previous) => ({ ...previous, max: numberValue }));
  };

  const handleApply = () => {
    onApply(temporaryRange);
    onOpenChange(false);
  };

  const handleClear = () => {
    setTemporaryRange({ min: null, max: null });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTemporaryRange(currentRange);
    }
    onOpenChange(newOpen);
  };

  const sliderMin = temporaryRange.min ?? availableRange.min;
  const sliderMax = temporaryRange.max ?? availableRange.max;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtruj według zakresu cen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {sliderMin.toFixed(2)} PLN
              </span>
              <span className="text-sm font-medium">
                {sliderMax.toFixed(2)} PLN
              </span>
            </div>

            <Slider
              min={availableRange.min}
              max={availableRange.max}
              step={1}
              value={[sliderMin, sliderMax]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-price">Minimalna cena</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  PLN
                </span>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="0"
                  value={temporaryRange.min ?? ""}
                  onChange={(event_) => {
                    handleMinChange(event_.target.value);
                  }}
                  className="pl-12"
                  min={availableRange.min}
                  max={availableRange.max}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-price">Maksymalna cena</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  PLN
                </span>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="1000"
                  value={temporaryRange.max ?? ""}
                  onChange={(event_) => {
                    handleMaxChange(event_.target.value);
                  }}
                  className="pl-12"
                  min={availableRange.min}
                  max={availableRange.max}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex w-full flex-row gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 sm:flex-1"
          >
            Wyczyść
          </Button>
          <Button onClick={handleApply} className="flex-1 sm:flex-1">
            Zastosuj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
