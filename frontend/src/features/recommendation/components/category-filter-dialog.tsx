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

export function CategoryFilterDialog({
  open,
  onOpenChange,
  availableCategories,
  selectedCategories,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableCategories: string[];
  selectedCategories: string[];
  onApply: (categories: string[]) => void;
}) {
  const [temporarySelection, setTemporarySelection] =
    useState<string[]>(selectedCategories);

  const handleCheckChange = (category: string, checked: boolean) => {
    if (checked) {
      setTemporarySelection((previous) => [...previous, category]);
    } else {
      setTemporarySelection((previous) =>
        previous.filter((c) => c !== category),
      );
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
      setTemporarySelection(selectedCategories);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter by Category</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {availableCategories.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No categories available
              </p>
            ) : (
              availableCategories.map((category) => (
                <div key={category} className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category}`}
                    checked={temporarySelection.includes(category)}
                    onCheckedChange={(checked) => {
                      handleCheckChange(category, checked === true);
                    }}
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                  {temporarySelection.includes(category) && (
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
            Clear
          </Button>
          <Button onClick={handleApply} className="flex-1 sm:flex-1">
            Apply ({temporarySelection.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
