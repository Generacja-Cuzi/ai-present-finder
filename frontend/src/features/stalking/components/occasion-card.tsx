import { Cake, Flame, Heart, Smile } from "lucide-react";

import { cn } from "@/lib/utils";

export type Occasion = "birthday" | "anniversary" | "holiday" | "just-because";

interface OccasionCardProps {
  occasion: Occasion;
  selected: boolean;
  onSelect: () => void;
}

const occasionConfig = {
  birthday: {
    icon: Cake,
    label: "Birthday",
    color: "text-[#E89B3C]",
  },
  anniversary: {
    icon: Heart,
    label: "Anniversary",
    color: "text-[#E89B3C]",
  },
  holiday: {
    icon: Flame,
    label: "Holiday",
    color: "text-[#E89B3C]",
  },
  "just-because": {
    icon: Smile,
    label: "Just Because",
    color: "text-[#E89B3C]",
  },
};

export function OccasionCard({
  occasion,
  selected,
  onSelect,
}: OccasionCardProps) {
  const config = occasionConfig[occasion];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-all duration-200",
        selected
          ? "border-[#E89B3C] bg-[#FFF8F0] shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      <Icon
        className={cn("size-10", selected ? config.color : "text-gray-400")}
        strokeWidth={1.5}
      />
      <span
        className={cn(
          "text-base font-medium",
          selected ? "text-gray-900" : "text-gray-600",
        )}
      >
        {config.label}
      </span>
    </button>
  );
}
