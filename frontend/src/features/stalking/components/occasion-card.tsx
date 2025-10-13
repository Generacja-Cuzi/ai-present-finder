import { Cake, Flame, Heart, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Occasion = "birthday" | "anniversary" | "holiday" | "just-because";

const occasionConfig = {
  birthday: {
    icon: Cake,
    label: "Birthday",
    color: "text-brand",
  },
  anniversary: {
    icon: Heart,
    label: "Anniversary",
    color: "text-brand",
  },
  holiday: {
    icon: Flame,
    label: "Holiday",
    color: "text-brand",
  },
  "just-because": {
    icon: Smile,
    label: "Just Because",
    color: "text-brand",
  },
};

export function OccasionCard({
  occasion,
  selected,
  onSelect,
}: {
  occasion: Occasion;
  selected: boolean;
  onSelect: () => void;
}) {
  const config = occasionConfig[occasion];
  const Icon = config.icon;

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "h-auto shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-all duration-200",
        selected
          ? "border-brand bg-[#FFF8F0]"
          : "bg-background border-gray-200 hover:border-gray-300 hover:bg-gray-50",
      )}
      onClick={onSelect}
    >
      <Icon
        className={cn("size-10", selected ? "text-brand" : "text-gray-400")}
        strokeWidth={1.5}
      />
      <span
        className={cn(
          "text-base font-medium",
          selected ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {config.label}
      </span>
    </Button>
  );
}
