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

export function ShopsFilterDialog({
  open,
  onOpenChange,
  availableShops,
  selectedShops,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableShops: string[];
  selectedShops: string[];
  onApply: (shops: string[]) => void;
}) {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedShops);

  const handleCheckChange = (shop: string, checked: boolean) => {
    if (checked) {
      setTempSelection((previous) => [...previous, shop]);
    } else {
      setTempSelection((previous) => previous.filter((s) => s !== shop));
    }
  };

  const handleApply = () => {
    onApply(tempSelection);
    onOpenChange(false);
  };

  const handleClear = () => {
    setTempSelection([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTempSelection(selectedShops);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter by Shops</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {availableShops.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No shops available
              </p>
            ) : (
              availableShops.map((shop) => (
                <div key={shop} className="flex items-center space-x-3">
                  <Checkbox
                    id={`shop-${shop}`}
                    checked={tempSelection.includes(shop)}
                    onCheckedChange={(checked) =>
                      handleCheckChange(shop, checked === true)
                    }
                  />
                  <label
                    htmlFor={`shop-${shop}`}
                    className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {shop}
                  </label>
                  {tempSelection.includes(shop) && (
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
            Apply ({tempSelection.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
