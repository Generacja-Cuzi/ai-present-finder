import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FilterButton({
  label,
  onClick,
  isActive = false,
  activeCount,
}: {
  label: string;
  onClick: () => void;
  isActive?: boolean;
  activeCount?: number;
}) {
  return (
    <Button
      variant="secondary"
      className={cn(
        "h-10 rounded-full px-4 text-sm font-normal hover:bg-gray-200",
        isActive
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
          : "bg-gray-100 text-gray-700",
      )}
      onClick={onClick}
    >
      {label}
      {activeCount !== undefined && activeCount > 0 && (
        <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
          {activeCount}
        </span>
      )}
      <ChevronDown className="ml-1 h-4 w-4" />
    </Button>
  );
}
