import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FilterButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="secondary"
      className="h-10 rounded-full bg-gray-100 px-4 text-sm font-normal text-gray-700 hover:bg-gray-200"
      onClick={onClick}
    >
      {label}
      <ChevronDown className="ml-1 h-4 w-4" />
    </Button>
  );
}
