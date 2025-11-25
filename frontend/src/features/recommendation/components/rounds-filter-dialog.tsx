import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RoundsFilterDialog({
  open,
  onOpenChange,
  availableRounds,
  selectedRounds,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableRounds: number[];
  selectedRounds: number[];
  onApply: (rounds: number[]) => void;
}) {
  const [temporarySelection, setTemporarySelection] =
    useState<number[]>(selectedRounds);

  const handleCheckChange = (round: number, checked: boolean) => {
    if (checked) {
      setTemporarySelection((previous) => [...previous, round]);
    } else {
      setTemporarySelection((previous) => previous.filter((r) => r !== round));
    }
  };

  const handleApply = () => {
    onApply(temporarySelection);
    onOpenChange(false);
  };

  const handleClear = () => {
    setTemporarySelection([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTemporarySelection(selectedRounds);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtruj według tury</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {availableRounds.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                Brak dostępnych tur
              </p>
            ) : (
              availableRounds.map((round) => (
                <div key={round} className="flex items-center space-x-3">
                  <Checkbox
                    id={`round-${String(round)}`}
                    checked={temporarySelection.includes(round)}
                    onCheckedChange={(checked) => {
                      handleCheckChange(round, checked === true);
                    }}
                  />
                  <label
                    htmlFor={`round-${String(round)}`}
                    className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tura {String(round)}
                  </label>
                  {temporarySelection.includes(round) && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex w-full flex-row gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 sm:flex-1"
          >
            Wyczyść
          </Button>
          <Button onClick={handleApply} className="flex-1 sm:flex-1">
            Zastosuj ({temporarySelection.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
