import { FilterX } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ClearFiltersButton({
  activeCount,
  onClear,
}: {
  activeCount: number;
  onClear: () => void;
}) {
  if (activeCount === 0) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClear}
      className="h-10 rounded-full px-4 text-sm text-gray-600 hover:text-gray-900"
    >
      <FilterX className="mr-2 h-4 w-4" />
      Clear all ({activeCount})
    </Button>
  );
}
